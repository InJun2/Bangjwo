import requests
import time
import re
import os

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from dotenv import load_dotenv

# 환경 변수 세팅
load_dotenv()
openai_api_key = os.getenv('OPENAI_API_KEY')
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다.")

stored_final_url = None
vectorstore = None
retriever = None
qa_chain = None

base_url = "https://www.law.go.kr"
main_url = "https://www.law.go.kr/법령/주택임대차보호법"
headers = {"User-Agent": "Mozilla/5.0"}

# GPT 모델 초기화
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0, openai_api_key=openai_api_key)

def crawl_and_update_vector_db(final_url: str):
    """
    주어진 final_url로 Selenium을 이용해 법령 데이터를 크롤링한 후,
    조문 단위로 분리하여 Chroma 벡터 DB를 업데이트합니다.
    """
    global vectorstore, retriever, qa_chain

    options = Options()
        options.add_argument('--headless')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')

        options.binary_location = "/usr/bin/chromium"
        driver = webdriver.Chrome(service=Service("/usr/bin/chromedriver"), options=options)
    
    driver.get(final_url)
    time.sleep(3)
    
    try:
        driver.switch_to.frame("lawService")
        time.sleep(1)
    except Exception as e:
        print("iframe 전환 실패:", e)
    
    html = driver.page_source
    driver.quit()
    
    # 법령 본문 추출
    soup_final = BeautifulSoup(html, "html.parser")
    container = soup_final.find("div", class_="law_text")
    if container is None:
        container = soup_final.body  
    full_text = container.get_text(separator="\n", strip=True)
    
    # 정규표현식으로 '제 X조' 단위로 분리
    pattern = r"(제\s*\d+\s*조)"
    splits = re.split(pattern, full_text)
    articles = []
    if len(splits) > 1:
        for i in range(1, len(splits), 2):
            header = splits[i].strip()
            content = splits[i+1].strip() if i+1 < len(splits) else ""
            article_text = f"{header} {content}"
            articles.append(article_text)
    else:
        articles.append(full_text)
    
    # 문서 데이터 생성
    documents = []
    for idx, article in enumerate(articles):
        doc = {"id": str(idx), "content": article}
        documents.append(doc)
    
    texts = [doc["content"] for doc in documents]
    metadatas = [{"id": doc["id"]} for doc in documents]
    ids = [doc["id"] for doc in documents]
    
    # OpenAI 임베딩 모델을 이용해 Chroma 벡터 DB 생성 및 저장
    embeddings = OpenAIEmbeddings(api_key=openai_api_key)
    vectorstore = Chroma.from_texts(
        texts,
        embeddings,
        metadatas=metadatas,
        ids=ids,
        collection_name="law_articles",
        persist_directory="./law_db"
    )
    vectorstore.persist()
    
    print("새 벡터 DB 업데이트 완료!")
    
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True
    )
    return vectorstore

def check_and_update_vector_db():
    """
    메인 페이지에서 최신 final_url을 추출하고, 전역 stored_final_url과 비교합니다.
    변경되었을 경우, 새로운 final_url로 벡터 DB를 업데이트합니다.
    """
    global stored_final_url, vectorstore, retriever, qa_chain

    # 법령 url 추출
    response = requests.get(main_url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    iframe = soup.find("iframe", id="lawService")
    if iframe and iframe.has_attr("src"):
        relative_src = iframe["src"].replace("&amp;", "&")
        new_final_url = base_url + relative_src
        print("새 final_url 추출:", new_final_url)
    else:
        print("iframe의 src를 찾지 못했습니다.")
        new_final_url = None

    # 기존 법령 url과 비교
    if new_final_url != stored_final_url:
        print("final_url이 변경되었습니다. 벡터 DB를 업데이트합니다.")
        stored_final_url = new_final_url
        if stored_final_url:
            vectorstore = crawl_and_update_vector_db(stored_final_url)
    else:
        print("final_url이 변경되지 않았습니다.")
    return stored_final_url, vectorstore, retriever, qa_chain

def add_special_conditions_to_vector_db():
    global vectorstore

    special_conditions_text = """
    1. 본 계약 당사자들은 계약에 필요한 개인 정보제공 및 활용에 동의한다.
    2. 임차인은 임차물건 현장확인 및 등기사항전부증명서, 건축물대장, 신분증 등을 확인하고 체결하는 계약이다.
    3. 당사자의 일방적인 이유로 계약해제 시 임대인은 계약금 배액상환, 임차인은 계약금을 포기하기로 한다. (계약금은 위약금의 성격을 갖는다.)
    4. 관리비가 있을 경우, 금액과 내역, 선불/후불 여부를 기재하며, 제외되는 공과금과 항목도 명시한다.
    5. 옵션이 있을 경우, 제공 항목과 임차인의 파손 책임을 기재하며 자연마모는 제외한다. 옵션이 없으면 없다고 명시한다.
    6. 퇴실청소비가 있을 경우, 금액 및 입금방식 기재. 없을 경우, 입주 상태와 동일 조건 퇴실 기재.
    7. 임대차 관련 금전(계약금, 보증금, 월세 등) 이체용 임대인 계좌번호를 기재. 계좌가 다를 경우 구분 기재.
    8. 임차인은 건물 내 실내흡연을 금지한다.
    9. 반려동물 금지 시 사육 금지 및 위반 시 계약해지 및 손해 배상 책임 명시. 허용 시 손상 시 원상복구 조건.
    10. 공동생활 문제(고성방가, 불법행위 등) 발생 시 계약 해지 및 손해 책임 명시.
    11. 입주 전 수리/도배/장판 등 사전 작업 내용을 구체적으로 기재.
    12. 임차물 자체로 인한 불이익 발생 시 임대인이 전세금 반환, 이사비용 및 지연이자 배상 책임.
    13. 잔금 전 하자 보수(누수, 결로, 보일러 고장 등)는 임대인 책임으로 완료한다.
    14. 임대차계약 만료 시 임차인 퇴거 여부와 관계없이 보증금을 즉시 반환하며, 미반환 시 임차권등기 협조 서류 제공.
    15. 본 계약에 포함되지 않은 사항은 관련 법규 및 부동산 관례에 따른다.
    """

    embeddings = OpenAIEmbeddings(api_key=openai_api_key)
    vectorstore.add_texts(
        texts=[special_conditions_text],
        metadatas=[{"id": "special-conditions"}],
        ids=["special-conditions"],
    )
    vectorstore.persist()
    print("특약사항 레퍼런스 문서를 벡터 DB에 추가했습니다.")

# 초기 벡터 DB 설정
response = requests.get(main_url, headers=headers)
soup = BeautifulSoup(response.text, "html.parser")
iframe = soup.find("iframe", id="lawService")
if iframe and iframe.has_attr("src"):
    relative_src = iframe["src"].replace("&amp;", "&")
    stored_final_url = base_url + relative_src
    print("초기 final_url 추출 성공:", stored_final_url)
    vectorstore = crawl_and_update_vector_db(stored_final_url)
else:
    print("초기 iframe의 src를 찾지 못했습니다.")
    stored_final_url = None

app = FastAPI(root_path="/ai")

origins = [
    "http://localhost:5173",
    "https://j12a404.p.ssafy.io"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

# 페르소나 설정
persona_context = (
    "당신은 부동산 계약 전문가 '방이'입니다. "
    "사용자가 부동산 계약과 관련된 질문을 하면, 전문가로서 **친절하고 명확하게, 그리고 두괄식으로 답변해 주세요.** "
    "답변은 '~입니다'보다는 '~해요', '~돼요', '~할 수 있어요'처럼 **조금 더 부드럽고 친근한 말투**를 사용해 주세요. "
    "특히 임대차 계약서와 관련된 특약사항에 대한 질문에 대해 전문적인 조언을 제공하세요. "
    "충분한 근거 없이 답변하지 말고, 정보가 불확실한 경우 '알 수 없습니다.'라고 명시하세요. "
    "답변 전에 단계별로 정보를 검증하고, 모호하거나 출처가 불분명한 부분은 '확실하지 않음'이라고 표시하세요. "
    "최종적으로 확실한 정보만 사용하여 간결한 답변을 완성하세요. "
    "사용자의 문의가 모호하거나 추가 정보가 필요하면, 먼저 추가 정보를 요청하세요. "
    "각 답변에는 참고한 출처나 조문이 있다면 간단히 정리해서 함께 알려 주세요."
)

special_conditions_script = """
1. 본 계약 당사자들은 계약에 필요한 개인 정보제공 및 활용에 동의한다.
2. 임차인은 임차물건 현장확인 및 등기사항전부증명서, 건축물대장, 신분증 등을 확인하고 체결하는 계약이다.
3. 당사자의 일방적인 이유로 계약해제 시 임대인은 계약금 배액상환, 임차인은 계약금을 포기하기로 한다. (계약금은 위약금의 성격을 갖는다.)
4. 관리비가 있을 경우, 금액과 관리비에 포함되는 내역, 후불인지 선불인지를 자세히 기재한다.
5. 옵션(~ 등)을 제공하고, 임차인의 사용부주의로 인한 옵션 및 기타 시설파손 시 임차인이 책임(원상복구 혹은 전액배상)을 진다. 단, 자연(생활) 마모는 제외한다.
6. 퇴실 청소비가 있을 경우, 퇴실 청소비 금액과 입금 방식을 기재한다.
7. 임차인은 건물 내 실내흡연을 금지한다.
8. 반려동물 금지 시, '임차인은 반려동물 사육을 금지한다. 지켜지지 않을 시 계약해지의 사유가 될 수 있으며, 문제발생에 관한 모든 비용은 임차인이 부담한다.'
9. 본 계약에 포함되지 않는 내용은 관련 법규나 관례에 따른다.
"""

@app.post("/api/v1/chatbot/message")
async def ask_question(question: Question):
    user_question = question.question
    current_time = datetime.now(timezone.utc).isoformat()

    try:
        # 특약사항 관련 질문 분기 처리
        if "특약" in user_question and "가이드라인" in user_question:
            answer = f"다음은 임대차 계약서에 포함할 수 있는 특약사항입니다:\n{special_conditions_script}"
        elif "특약" in user_question and ( 
            "평가" in user_question or "유리" in user_question or "불리" in user_question 
        ):
            evaluation_prompt = (
                f"{persona_context}\n\n"
                "다음 특약사항 조항에 대해 평가해 주세요.\n"
                "1. 이 조항이 임차인에게 **유리한지** 혹은 **불리한지** 판정해 주세요. "
                "즉, '유리하다' 또는 '불리하다'라고 명시해 주세요.\n"
                "2. 개선해야 할 점이나 주의사항이 있다면 구체적으로 조언해 주세요.\n\n"
                f"특약사항 조항: {user_question}"
            )
            check_and_update_vector_db()
            result = qa_chain({"query": evaluation_prompt})
            answer = result.get("result", "답변을 생성할 수 없습니다.")
        elif "특약" in user_question:
            # 최신 법령 url 확인 후, 필요시 벡터 DB 업데이트
            check_and_update_vector_db()
            gpt_query = (
                f"{persona_context}\n\n"
                f"사용자가 부동산 특약사항에 대해 질문했어요: {user_question}\n\n"
                "아래는 임대차 계약서에 참고할 수 있는 특약사항 레퍼런스입니다:\n"
                f"{special_conditions_script}\n\n"
                "위 내용을 참고해서 질문에 친절하고 정확하게 답변해 주세요."
            )
            result = qa_chain({"query": gpt_query})
            answer = result.get("result", "답변을 생성할 수 없습니다.")
        else:
            # 최신 법령 url 확인 후, 필요시 벡터 DB 업데이트
            check_and_update_vector_db()
            query = f"{persona_context}\n\n{user_question}"
            result = qa_chain({"query": query})
            answer = result.get("result", "답변을 생성할 수 없습니다.")
    except Exception as e:
        error_message = f"qa_chain 호출 중 오류: {str(e)}"
        raise HTTPException(status_code=500, detail=error_message)
    
    answer_current_time = datetime.now(timezone.utc).isoformat()
    response = {
        "data": [
            {"sender": "user", "message": user_question, "timestamp": current_time},
            {"sender": "chatbot", "message": answer, "timestamp": answer_current_time}
        ]
    }
    return response
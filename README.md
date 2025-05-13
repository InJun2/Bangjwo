 
# 🏠 방줘 : 중개사 없이 싸고 안전하게  
> 블록체인 기반 원스톱 부동산 거래 플랫폼  

---

## 📌 프로젝트 소개

**"방줘"**는 부동산 중개 수수료와 사기 위험을 줄이기 위해  
**AI와 블록체인을 결합**하여 만든 부동산 거래 플랫폼입니다.

- 맞춤형 매물 탐색부터 계약 체결까지 한 번에!
- 계약서 작성이 어려울 땐 AI 챗봇이 도와드립니다.
- 계약은 블록체인에 기록되어 위변조 걱정 없이 투명하게!

## 시스템 아키텍처처

<p align="center">
  <img src="./images/bangjwo_architecture.png" alt="Architecture Diagram" width="600"/>
</p>

---

## ⚙️ 기술 스택

| 분야 | 기술 |
|------|------|
| **Frontend** | React, Typescript, TailwindCSS, TanStack Query |
| **Backend** | Spring Boot, Spring Data JPA |
| **Database** | MySQL, Redis, MongoDB, AWS S3 |
| **Infrastructure** | AWS EC2, Docker, Nginx |
| **Blockchain** | Remix, Truffle, Solidity, Web3.0 |
| **AI** | OpenAI API (GPT 기반 챗봇) |

---

## 요구사항 명세서

<p align="center">
  <img src="./images/bangjwo_requirement_statement.JPG" alt="Requirement Statement" width="600"/>
</p>


## API 명세서

<p align="center">
  <img src="./images/bangjwo_api_statement.JPG" alt="API Statement" width="600"/>
  <img src="https://github.com/InJun2/Bangjwo/blob/main/images/swagger.png" alt="API Statement" width="600"/>
</p>

## ✨ 주요 기능

1. **맞춤형 부동산 매물 탐색**  
   - 사용자의 조건 기반 필터링 (위치, 가격, 구조 등)
   - 즉시 확인 가능한 매물 카드 뷰 제공

2. **AI 기반 스마트 계약서 지원**  
   - 계약서 항목 실시간 설명
   - 법률 용어 및 특약 조건 이해 보조

3. **블록체인 기반 계약서 관리**  
   - IPFS 및 블록체인 기록으로 위변조 방지
   - 투명하고 신뢰성 있는 거래 제공

4. **등기부 기반 사기 예방 시스템**  
   - 등기부등본 자동 판독 및 위험도 분석
   - 사기 위험 매물 사전 경고 제공

5. **계약서 작성 보조 시스템**  
   - 챗봇 연동을 통한 용어/조항 실시간 설명
   - 사용자 중심의 직관적 계약서 작성 환경

## Figma

<p align="center">
  <img src="./images/bangjwo_figma.jpg" alt="Figma Design" width="600"/>
  <img src="./images/bangjwo_figma_2.png" alt="Figma Design 2" width="600"/>
  <img src="./images/bangjwo_figma_3.png" alt="Figma Design 3" width="600"/>
</p>

---

## ERD

<p align="center">
  <img src="./images/bangjwo_erd.png" alt="ERD Diagram" width="600"/>
</p>

---

## 🙋 팀원 소개

| 이름 | 역할 | 담당 |
|------|------|------|
| 김범준 | PM, Backend, Infra | 일정관리, 채팅/포트원, 서버 |
| 강현지 | Frontend | 계약서/채팅/챗봇, 영상 제작 |
| 백지민 | Frontend | 메인페이지/매물/회원/Info |
| 강보영 | AI | OpenAI 챗봇 시스템 |
| 하정수 | Backend, BlockChain | 블록체인, 계약/암호화 |
| 황인준 | Backend | 환경설정, 매물/회원/로그인 |

<br>

## 서버 트러블 슈팅

### 1. 공통 모듈 분리

**이슈 발생 환경**

- 팀원마다 도메인을 구현하는데 있어 일관되고 명확한 예외 메시지를 반환하여야 했습니다.
- `JPA`를 사용하여 `Page` 컬렉션을 반환하는데 일관된 페이지 필터링 조건과 기본값 설정이 필요했습니다.
- 유저 프로필 이미지, 매물 이미지, 계약 서명, 등기부등본 PDF 등 다양한 도메인에서 `AWS S3`에 파일을 저장하거나 조회가 필요하여 중복된 코드가 발생하였습니다.
- API 마다 로그인 정보가 필요한 API가 있고 필요없는 API가 존재하고, 추가적으로 찜 매물 여부 같은 로그인 정보가 있다면 추가적인 로직이 필요한 API들이 존재했습니다.

**이슈 해결 고민 및 해결 방법**

- 일관된 상태코드, 서버 예외 코드, 예외 메시지 등을 보유한 객체가 필요하고, 도메인마다 관리를 할 수 있도록 도메인 별 예외 객체를 관리하도록 설계가 필요하였습니다. 이에 있어 상태코드, 서버 예외 코드, 예외 메시지 등을 조회하는 인터페이스를 도메인 마다 상속한 `ENUM` 예외 구현체를 생성하였습니다. 또한 해당 인터페이스를 파라미터로 가지는 커스텀 예외 클래스를 생성하여 전역으로 예외를 관리하였습니다.
- `JPA` 에서는 `Page`객체를 지원하여 엔티티들을 받아올 수 있는데, `Pageable`객체를 파라미터로 사용하여 특정 개수의 페이지 조회가 가능했습니다. 이에 Util 클래스를 구현하여 기본값을 지정한 `Page` 객체를 반환하였습니다.
- 하나의 도메인에서 매번 `AWS S3` 정보를 관리하고 있는 구조가 잘못된 설계로 판단되어 관련 데이터를 관리하는 어댑터 클래스를 구현하였습니다. 이후 각 도메인 서비스 계층에서 어댑터 클래스를 의존성 주입하여 다른 도메인에서 쉽게 파일을 업로드하도록 변경하였습니다.
- 우선 로그인 정보가 필요한 API에 있어 표현 계층에서 커스텀 어노테이션을 추가하고, `ArgumentResolver`에서 `JWT`를 파싱하고 유저 ID를 반환하도록 구현했습니다. 하지만 아직 찜 매물 조회 같은 로그인 정보가 있다면 추가적으로 로직이 필요한 경우가 존재했고, 이를 해결하기 위해 커스텀 어노테이션 내부에 `Boolean`값의 변수 관리를 통해 기본값이 아니라면 `null`인 유저 ID를 반환하도록 하였습니다.

**개선된 사항**

- 도메인 마다 예외 메시지를 관리하기 용이해졌고, 클라이언트는 일관된 형식의 예외 메시지를 반환받을 수 있었습니다.
- 간단하게 `Page` 객체를 반환할 수 있었고, `JPA` 내부적으로 필요한 개수의 엔티티만을 조회하여 성능이 개선되었습니다.
- `AWS S3` 정보를 도메인마다 관리하지 않고 특정 어댑터 클래스가 관리하여 의존성 주입을 통해 사용이 용이해지고, 중복 코드가 감소하는 등 더 객체 지향적인 코드를 구현할 수 있었습니다.
- 로그인 정보가 필요한 API를 개발자들이 한눈에 보기 용이해졌고, 로그인 정보를 파싱하는 작업을 전처리하여 간단하게 유저 ID를 반환받을 수 있었습니다.

<br>

### 2. 단방향 연관관계 N+1 문제 해결

**이슈 발생 환경**

- 엔티티간 연관 관계에 있어 매물을 바라보는 여러 엔티티들이 존재하여, 여러 엔티티 내부에 매물 정보가 있는 단방향 구조로 구성하였습니다.
- 단방향으로 적용한 이유는 다른 사람들이 연관 관계를 이해하기 쉽고, 순환 참조를 방지하기 위해 단방향으로 구성하였는데 이후 매물 페이지 정보들을 조회하고 이후 매물과 연관된 객체를 가져오는데 있어 조회한 `Page`의 개수 만큼 N + 1 문제가 발생하였습니다.

**이슈 해결 고민 및 해결**

- 이를 해결하는 방법으로는 매물 엔티티에서 양방향 연관관계를 추가하고 `JPQL` 코드를 통해 필요한 API 에서 쿼리 한번에 엔티티들을 가져오는 방법과 네이티브 쿼리, `IN` 절을 사용한 배치 처리 등이 존재했습니다.
- 우선 `Spring Data JPA` 공식 문서에 따르면, 페치 조인 + 페이징은 권장하지 않으며, 양방향 구조를 가져가는 것은 팀원간 연관 엔티티 이해 및 사용에 있어 어려울 것이라고 생각하였습니다.
- 네이티브 쿼리의 경우는 반환값이 엔티티가 아니라면 영속성 컨테이너에서 관리를 하지 못하여 객체지향 코드 구현 및 영속성 컨테이너 관리가 어려워질 것 같다고 생각하여, `IN` 절을 사용한 배치 처리를 적용하였습니다.
- 우선 페이지만큼의 엔티티를 조회하고, 조회한 엔티티들과 연관된 엔티티의 ID들을 `Map`으로 보관하였습니다. 해당 `Map`에 조회하고자 하는 엔티티의 ID들을 `IN`절으로 한번에 조회했습니다.

```java
// SQL 3번 조회됨을 확인
Hibernate: 
    /* <criteria> */ select
        r1_0.room_id,
        r1_0.available_from,
        ...
    from
        room r1_0 
    where
        r1_0.monthly_rent<=? 
        and (
            r1_0.exclusive_area between ? and ? 
            or r1_0.exclusive_area between ? and ? 
            or r1_0.exclusive_area between ? and ?
        ) 
        and r1_0.room_id in ((select
            a1_0.room_id 
        from
            address a1_0 
        where
            a1_0.lat between ? and ? 
            and a1_0.lng between ? and ?)) 
    limit
        ?, ?
Hibernate:
         select
            l1_0.like_id,
            l1_0.member_id,
            l1_0.room_id
            ...
        from
            likes l1_0 
        where
            l1_0.room_id in (?, ?, ?) 
            and l1_0.member_id=?
Hibernate: 
        select
            i1_0.image_id,
            i1_0.image_url,
            i1_0.room_id,
            ...
        from
            image i1_0 
        where
            i1_0.room_id in (?, ?, ?) 
            and i1_0.created_at=(
                select
                    max(i2_0.created_at) 
                from
                    image i2_0 
                where
                    i2_0.room_id=i1_0.room_id
            )
```

**개선된 사항**

- 이를 통해 발생하는 `Hibernate` 조회 수가 해당 횟수만큼 감소된 것을 확인하였습니다. 결과적으로 등록된 매물 조회 리스트가 1 + 2N 번 조회에서 3번 조회되도록 개선되었습니다

<br>

### 3. 계약서 작성 동시성 문제 해결

**이슈 발생 환경**

- 계약서 작성 순서는 다음과 같습니다.
    1. 계약서 생성
    2. 임대인 계약서 저장
    3. 임차인 계약서 저장
    4. 작성된 계약서를 각자 최종 조회 후 수정
    5. 임차인 서명
    6. 임대인 서명
    7. 계약 최종 완료
- 해당 과정에 있어 임차인 서명하는 동안 임대인이 계약서를 수정하고 있는 경우가 존재하고, 임차인이 서명 완료하는 시점에 봤었던 계약서 내용과 달라질 수 있는 문제가 발생하였습니다.

**이슈 해결 고민 및 해결**

- 이를 해결하기 위해 한 스레드가 임대인 계약서를 수정하고 있거나, 임차인이 서명하고 있는 경우 접근하지 못하는 수단이 필요했습니다.
- 이를 해결하기 위해 락을 사용하여 접근을 막는 방법이 필요했는데 방법으로는 JVM 내부 락(`synchronized`, `ReentrantLock`), 스핀락 구현, `Redission`분산락, DB 낙관적/비관적 락 등이 존재했습니다.
- 결과적으로 Redis를 사용한 단순 락으로 문제를 해결하려고 하였는데, 그렇게 생각한 이유는 다음과 같습니다.
    - 스레드의 비정상적인 종료에 대비하여 자동으로 락을 해제하는 방법이 필요했고, 이는 JVM 내부 락은 한계 존재
    - Heartbeat Cheking의 스핀락의 경우 불필요한 CPU 점유 발생
    - 물리 DB를 직접 조회하고 상태를 확인하고 락을 거는 과정이 불필요한 물리 I/O 연산이나 병목을 추가한다고 판단
    - `Redission` 은 TTL 자동 연장 같은 여러 기능이 존재하지만 현재 락 요구 수준에서는 계약 관련 2명만이 하나의 계약서에 접근하고 있어 라이브러리 도입이 과도하다고 판단
    - 현재 프로젝트는 모놀리식 구조로 분산 환경을 고려할 필요는 없지만, 이후 `MSA`구조로 확장이 용이
    - 해당 이슈가 발생한 시점에서 이미 채팅 관련으로 Redis를 사용하고 있음
    - 이를 통해 싱글 스레드 기반인 `Redis`의 TTL을 통해 락 자동 해제를 목표
- 이를 통해 기존 서비스에서 호출해서 사용하기 용이하도록 서비스 계층에서 퍼사드 패턴을 적용하여 `Redis Lock`을 사용하도록 하였습니다.
    - `@RedisLock(key = "'contract:' + #requestDto.contractId", errorCode = RedisLockErrorCode.*LANDLORD_IN_PROGRESS*)` 와 같이 커스텀 어노테이션으로 서비스 메서드에 접근하였습니다.
- 해당 서비스는 락을 소유자만 해제할 수 있도록 `Lua` 스크립트를 사용하고 `setIfAbsent()` 메서드를 사용해 `Redis` 내부적으로 `SENTX`를 활용하여 락을 소유한 단일 스레드만 접근이 가능하도록 하였습니다.
- 추가적으로 `CountDownLatch`를 사용한 단위 테스트 코드를 작성하여 동시성 문제 해결을 확인하였습니다.

![동시성 문제 해결 이미지](./images/concurreny-test.gif)

**개선된 사항**

- 기존 로직을 변경하지 않고, 커스텀 어노테이션을 통해 원하는 도메인, 특정 서비스에 `Redis Lock`을 쉽게 적용할 수 있게 되었습니다.
- 테스트 코드를 통해 해당 로직이 다른 팀원에게 동시성 문제를 해결하였음을 보장할 수 있었습니다.

<br>

## 화면 구성

### 1. 카카오 로그인

![카카오 로그인](./images/login.gif)

<br>

### 2. 매물 등록

![임대인 매물 정보 등록](./images/room-input-info.gif)

![등록 매물 검증](./images/room-verify.gif)

<br>

### 3. 매물 조회 및 등기부등본 위험도 분석

![매물 조회](./images/contract-risk.gif)

<br>

### 4. 문의 채팅

![계약 문의 채팅](./images/chat.gif)

<br>

### 5. 계약서 작성

![임대인 계약서 작성](./images/landlord-contract.gif)

<br>

### 6. 계약서 챗봇

![계약서 챗봇](./images/AIchatbot.gif)

<br>

### 7. 마이페이지

![마이페이지](./images/mypage.gif)

USE bangjwo;

INSERT INTO member (member_id, kakao_id, name, birthday, phone, profile_url, nickname,
                    created_at, updated_at, deleted_at, is_auth)
SELECT 1,
       3904577474,
       '황인준',
       '1997-05-14',
       '01030222851',
       'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/members/e1f801c5-b774-4a16-a2a2-22615c0cf8d7_room.png',
       '집주인',
       NOW(),
       NOW(),
       NULL,
       true
WHERE NOT EXISTS (SELECT 1 FROM member WHERE member_id = 1);

INSERT INTO member (member_id, kakao_id, name, birthday, phone, profile_url, nickname,
                    created_at, updated_at, deleted_at, is_auth)
SELECT 2,
       987654321,
       '김철수',
       '1998-03-22',
       '010-5678-1234',
       'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/members/e1f801c5-b774-4a16-a2a2-22615c0cf8d7_room.png',
       '철수핑',
       NOW(),
       NOW(),
       NULL,
       true
WHERE NOT EXISTS (SELECT 1 FROM member WHERE member_id = 2);

INSERT INTO member (member_id, kakao_id, name, birthday, phone, profile_url, nickname,
                    created_at, updated_at, deleted_at, is_auth)
SELECT 3,
       123456789,
       '김성수',
       '1998-03-22',
       '010-5678-1234',
       'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/members/e1f801c5-b774-4a16-a2a2-22615c0cf8d7_room.png',
       '테스터',
       NOW(),
       NOW(),
       NULL,
       true
WHERE NOT EXISTS (SELECT 1 FROM member WHERE member_id = 3);

INSERT INTO member (member_id, kakao_id, name, birthday, phone, profile_url, nickname,
                    created_at, updated_at, deleted_at, is_auth)
SELECT 4,
       4206299294,
       '하정수',
       '1998-03-22',
       '010-5678-1234',
       'https://i.pinimg.com/236x/d8/a6/cb/d8a6cbb02bc2c5c27ae238db2e89425d.jpg',
       '정수핑',
       NOW(),
       NOW(),
       NULL,
       true
WHERE NOT EXISTS (SELECT 1 FROM member WHERE member_id = 4);

INSERT INTO room (room.room_id, member_id, building_type, status, real_estate_id,
                  deposit, monthly_rent, exclusive_area, supply_area,
                  total_units, floor, max_floor, parking_spaces,
                  available_from, permission_date, simple_description, description,
                  maintenance_cost, room_cnt, bathroom_cnt, direction,
                  verified, registry_paid, discussable, discuss_detail,
                  reviewable, is_phone_public, created_at, updated_at)
SELECT 1,
       1,
       'APARTMENT',
       'ON_SALE',
       '1146-1999-533320',
       1170000,
       430000,
       45.75,
       55.32,
       100,
       '5층',
       15,
       1,
       '2025-05-01',
       '2010-08-10',
       '조용한 주택가에 위치한 아파트',
       '가까운 거리에 마트와 지하철역이 있으며, 남향이라 채광이 좋습니다.',
       10,
       3,
       2,
       'SOUTH',
       TRUE,
       TRUE,
       TRUE,
       '보증금 조절 협의 가능',
       TRUE,
       FALSE,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1
                  FROM room
                  WHERE room_id = 1);



INSERT INTO options (room_id, option_name)
SELECT 1, 'AIR_CONDITIONER'
WHERE NOT EXISTS (SELECT 1 FROM options WHERE room_id = 1 AND option_name = 'AIR_CONDITIONER');
INSERT INTO options (room_id, option_name)
SELECT 1, 'REFRIGERATOR'
WHERE NOT EXISTS (SELECT 1 FROM options WHERE room_id = 1 AND option_name = 'REFRIGERATOR');
INSERT INTO options (room_id, option_name)
SELECT 1, 'WASHING_MACHINE'
WHERE NOT EXISTS (SELECT 1 FROM options WHERE room_id = 1 AND option_name = 'WASHING_MACHINE');



INSERT INTO maintenance_include (room_id, maintenance_include_name)
SELECT 1, 'WATER'
WHERE NOT EXISTS (SELECT 1
                  FROM maintenance_include
                  WHERE room_id = 1
                    AND maintenance_include_name = 'WATER');
INSERT INTO maintenance_include (room_id, maintenance_include_name)
SELECT 1, 'INTERNET'
WHERE NOT EXISTS (SELECT 1
                  FROM maintenance_include
                  WHERE room_id = 1
                    AND maintenance_include_name = 'INTERNET');
INSERT INTO maintenance_include (room_id, maintenance_include_name)
SELECT 1, 'ELECTRICITY'
WHERE NOT EXISTS (SELECT 1
                  FROM maintenance_include
                  WHERE room_id = 1
                    AND maintenance_include_name = 'ELECTRICITY');

INSERT INTO address (room_id, name, address_detail, postal_code, lat, lng, province, city, district)
SELECT 1,
       '서울특별시 강남구 봉은사로 290',
       '102동 843호',
       '04583',
       37.501277,
       127.0396,
       '서울특별시',
       '강남구',
       '역삼동'
WHERE NOT EXISTS (SELECT 1
                  FROM address
                  WHERE room_id = 1);

-- === Room 2 ===
INSERT INTO room (room_id, member_id, building_type, status, real_estate_id,
                  deposit, monthly_rent, exclusive_area, supply_area,
                  total_units, floor, max_floor, parking_spaces,
                  available_from, permission_date, simple_description, description,
                  maintenance_cost, room_cnt, bathroom_cnt, direction,
                  verified, registry_paid, discussable, discuss_detail,
                  reviewable, is_phone_public, created_at, updated_at)
SELECT 2,
       1,
       'VILLA_HOUSE',
       'ON_SALE',
       '1146-1999-937154',
       2420000,
       630000,
       38.20,
       48.00,
       20,
       '2층',
       5,
       0,
       '2025-06-01',
       '2015-03-05',
       '아늑한 빌라, 정원 포함',
       '한적한 동네에 위치한 빌라, 마당이 있어 반려동물과 생활하기 좋음.',
       5,
       2,
       1,
       'WEST',
       TRUE,
       TRUE,
       FALSE,
       '보증금, 월세 협의 가능',
       TRUE,
       TRUE,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM room WHERE room_id = 2);



INSERT INTO options (room_id, option_name)
SELECT 2, 'MICROWAVE'
WHERE NOT EXISTS (SELECT 1 FROM options WHERE room_id = 2 AND option_name = 'MICROWAVE');

INSERT INTO maintenance_include (room_id, maintenance_include_name)
SELECT 2, 'GAS'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_include WHERE room_id = 2 AND maintenance_include_name = 'GAS');

INSERT INTO address (room_id, name, address_detail, postal_code, lat, lng, province, city, district)
SELECT 2,
       '서울시 마포구 정원빌라',
       '103동 164호',
       '06466',
       37.5663,
       126.9015,
       '서울특별시',
       '마포구',
       '성산동'
WHERE NOT EXISTS (SELECT 1 FROM address WHERE room_id = 2);


-- === Room 3 ===
INSERT INTO room (room_id, member_id, building_type, status, real_estate_id,
                  deposit, monthly_rent, exclusive_area, supply_area,
                  total_units, floor, max_floor, parking_spaces,
                  available_from, permission_date, simple_description, description,
                  maintenance_cost, room_cnt, bathroom_cnt, direction,
                  verified, registry_paid, discussable, discuss_detail,
                  reviewable, is_phone_public, created_at, updated_at)
SELECT 3,
       1,
       'ONEROOM_TWOROOM',
       'ON_SALE',
       '1146-2003-052628',
       2880000,
       330000,
       25.00,
       30.00,
       10,
       '1층',
       3,
       0,
       '2025-04-15',
       '2018-01-20',
       '1.5룸 구조의 원룸',
       '역세권에 위치, 풀옵션 원룸으로 자취 초보에게 적합.',
       8,
       2,
       1,
       'EAST',
       TRUE,
       FALSE,
       TRUE,
       '단기임대도 가능',
       TRUE,
       TRUE,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM room WHERE room_id = 3);



INSERT INTO options (room_id, option_name)
SELECT 3, 'INDUCTION'
WHERE NOT EXISTS (SELECT 1 FROM options WHERE room_id = 3 AND option_name = 'INDUCTION');

INSERT INTO maintenance_include (room_id, maintenance_include_name)
SELECT 3, 'INTERNET'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_include WHERE room_id = 3 AND maintenance_include_name = 'INTERNET');

INSERT INTO address (room_id, name, address_detail, postal_code, lat, lng, province, city, district)
SELECT 3,
       '서울시 동작구 신대방원룸',
       '106동 756호',
       '01249',
       37.4993,
       126.9272,
       '서울특별시',
       '동작구',
       '신대방동'
WHERE NOT EXISTS (SELECT 1 FROM address WHERE room_id = 3);


-- === Room 4 ===
INSERT INTO room (room_id, member_id, building_type, status, real_estate_id,
                  deposit, monthly_rent, exclusive_area, supply_area,
                  total_units, floor, max_floor, parking_spaces,
                  available_from, permission_date, simple_description, description,
                  maintenance_cost, room_cnt, bathroom_cnt, direction,
                  verified, registry_paid, discussable, discuss_detail,
                  reviewable, is_phone_public, created_at, updated_at)
SELECT 4,
       1,
       'OFFICETEL',
       'ON_SALE',
       '1146-2004-178014',
       2190000,
       920000,
       42.00,
       52.00,
       300,
       '12층',
       20,
       2,
       '2025-07-01',
       '2020-11-11',
       '테라스 있는 오피스텔',
       '회사와 가까운 위치, 혼자 살기 좋은 구조와 뷰.',
       15,
       2,
       1,
       'SOUTHEAST',
       TRUE,
       TRUE,
       TRUE,
       '주차공간 넉넉함',
       TRUE,
       FALSE,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM room WHERE room_id = 4);



INSERT INTO options (room_id, option_name)
SELECT 4, 'BED'
WHERE NOT EXISTS (SELECT 1 FROM options WHERE room_id = 4 AND option_name = 'BED');

INSERT INTO maintenance_include (room_id, maintenance_include_name)
SELECT 4, 'CLEANING'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_include WHERE room_id = 4 AND maintenance_include_name = 'CLEANING');

INSERT INTO address (room_id, name, address_detail, postal_code, lat, lng, province, city, district)
SELECT 4,
       '서울시 강서구 테라스오피스텔',
       '102동 705호',
       '01608',
       37.5481,
       126.8361,
       '서울특별시',
       '강서구',
       '화곡동'
WHERE NOT EXISTS (SELECT 1 FROM address WHERE room_id = 4);


-- === Room 5 ===
INSERT INTO room (room_id, member_id, building_type, status, real_estate_id,
                  deposit, monthly_rent, exclusive_area, supply_area,
                  total_units, floor, max_floor, parking_spaces,
                  available_from, permission_date, simple_description, description,
                  maintenance_cost, room_cnt, bathroom_cnt, direction,
                  verified, registry_paid, discussable, discuss_detail,
                  reviewable, is_phone_public, created_at, updated_at)
SELECT 5,
       1,
       'APARTMENT',
       'ON_SALE',
       '1146-2020-348901',
       2700000,
       720000,
       50.00,
       60.00,
       150,
       '7층',
       18,
       1,
       '2025-08-10',
       '2005-09-01',
       '학군 좋은 아파트',
       '근처에 초·중·고 위치, 가족 단위 거주에 적합.',
       12,
       3,
       2,
       'NORTHEAST',
       TRUE,
       TRUE,
       TRUE,
       '조용한 단지 내 위치',
       TRUE,
       TRUE,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM room WHERE room_id = 5);



INSERT INTO options (room_id, option_name)
SELECT 5, 'ELEVATOR'
WHERE NOT EXISTS (SELECT 1 FROM options WHERE room_id = 5 AND option_name = 'ELEVATOR');

INSERT INTO maintenance_include (room_id, maintenance_include_name)
SELECT 5, 'HEATING'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_include WHERE room_id = 5 AND maintenance_include_name = 'HEATING');

INSERT INTO address (room_id, name, address_detail, postal_code, lat, lng, province, city, district)
SELECT 5,
       '서울시 양천구 학군아파트',
       '102동 499호',
       '01649',
       37.5242,
       126.8566,
       '서울특별시',
       '양천구',
       '목동'
WHERE NOT EXISTS (SELECT 1 FROM address WHERE room_id = 5);

-- === Room 6 ===
INSERT INTO room (room_id, member_id, building_type, status, real_estate_id,
                  deposit, monthly_rent, exclusive_area, supply_area,
                  total_units, floor, max_floor, parking_spaces,
                  available_from, permission_date, simple_description, description,
                  maintenance_cost, room_cnt, bathroom_cnt, direction,
                  verified, registry_paid, discussable, discuss_detail,
                  reviewable, is_phone_public, created_at, updated_at)
SELECT 6,
       3,
       'APARTMENT',
       'ON_SALE',
       '1146-2006-645729',
       1160000,
       1180000,
       51.44,
       42.22,
       72,
       '12층',
       18,
       1,
       '2025-05-10',
       '2020-04-11',
       '강변 근처 아파트',
       '한강 조망 가능, 산책로와 공원 가까움',
       11,
       3,
       1,
       'EAST',
       TRUE,
       TRUE,
       TRUE,
       '임대 조건 협의 가능',
       TRUE,
       FALSE,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM room WHERE room_id = 6);



INSERT INTO options (room_id, option_name)
SELECT 6, 'AIR_CONDITIONER'
WHERE NOT EXISTS (SELECT 1 FROM options WHERE room_id = 6 AND option_name = 'AIR_CONDITIONER');

INSERT INTO maintenance_include (room_id, maintenance_include_name)
SELECT 6, 'WATER'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_include WHERE room_id = 6 AND maintenance_include_name = 'WATER');

INSERT INTO address (room_id, name, address_detail, postal_code, lat, lng, province, city, district)
SELECT 6,
       '서울특별시 강남구 선릉로 2',
       '104동 173호',
       '03161',
       37.297,
       128.3152,
       '서울특별시',
       '강남구',
       '삼성동'
WHERE NOT EXISTS (SELECT 1 FROM address WHERE room_id = 6);

-- === Room 7 ===
INSERT INTO room (room_id, member_id, building_type, status, real_estate_id,
                  deposit, monthly_rent, exclusive_area, supply_area,
                  total_units, floor, max_floor, parking_spaces,
                  available_from, permission_date, simple_description, description,
                  maintenance_cost, room_cnt, bathroom_cnt, direction,
                  verified, registry_paid, discussable, discuss_detail,
                  reviewable, is_phone_public, created_at, updated_at)
SELECT 7,
       3,
       'ONEROOM_TWOROOM',
       'ON_SALE',
       '1146-1997-595704',
       2880000,
       480000,
       27.21,
       56.41,
       52,
       '2층',
       20,
       1,
       '2025-05-11',
       '2019-04-12',
       '역세권 신축 오피스텔',
       '지하철 도보 3분 거리, 깔끔한 내부 구조',
       13,
       1,
       2,
       'WEST',
       TRUE,
       TRUE,
       TRUE,
       '임대 조건 협의 가능',
       TRUE,
       FALSE,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM room WHERE room_id = 7);



INSERT INTO options (room_id, option_name)
SELECT 7, 'AIR_CONDITIONER'
WHERE NOT EXISTS (SELECT 1 FROM options WHERE room_id = 7 AND option_name = 'AIR_CONDITIONER');

INSERT INTO maintenance_include (room_id, maintenance_include_name)
SELECT 7, 'WATER'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_include WHERE room_id = 7 AND maintenance_include_name = 'WATER');

INSERT INTO address (room_id, name, address_detail, postal_code, lat, lng, province, city, district)
SELECT 7,
       '경기도 분당구 강남대로 189',
       '108동 596호',
       '06160',
       36.2196,
       128.102,
       '경기도',
       '분당구',
       '정자동'
WHERE NOT EXISTS (SELECT 1 FROM address WHERE room_id = 7);

-- === Room 8 ===
INSERT INTO room (room_id, member_id, building_type, status, real_estate_id,
                  deposit, monthly_rent, exclusive_area, supply_area,
                  total_units, floor, max_floor, parking_spaces,
                  available_from, permission_date, simple_description, description,
                  maintenance_cost, room_cnt, bathroom_cnt, direction,
                  verified, registry_paid, discussable, discuss_detail,
                  reviewable, is_phone_public, created_at, updated_at)
SELECT 8,
       2,
       'VILLA_HOUSE',
       'ON_SALE',
       '1146-2008-943212',
       2670000,
       1080000,
       48.88,
       37.47,
       199,
       '8층',
       17,
       0,
       '2025-05-12',
       '2018-04-12',
       '조용한 단독주택',
       '단독 주택 단지, 이웃 간섭 없는 환경',
       11,
       2,
       2,
       'SOUTH',
       TRUE,
       TRUE,
       TRUE,
       '임대 조건 협의 가능',
       TRUE,
       FALSE,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM room WHERE room_id = 8);



INSERT INTO options (room_id, option_name)
SELECT 8, 'AIR_CONDITIONER'
WHERE NOT EXISTS (SELECT 1 FROM options WHERE room_id = 8 AND option_name = 'AIR_CONDITIONER');

INSERT INTO maintenance_include (room_id, maintenance_include_name)
SELECT 8, 'WATER'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_include WHERE room_id = 8 AND maintenance_include_name = 'WATER');

INSERT INTO address (room_id, name, address_detail, postal_code, lat, lng, province, city, district)
SELECT 8,
       '부산광역시 해운대구 테헤란로 145',
       '106동 762호',
       '06184',
       36.2959,
       127.0929,
       '부산광역시',
       '해운대구',
       '중동'
WHERE NOT EXISTS (SELECT 1 FROM address WHERE room_id = 8);

-- === Room 9 ===
INSERT INTO room (room_id, member_id, building_type, status, real_estate_id,
                  deposit, monthly_rent, exclusive_area, supply_area,
                  total_units, floor, max_floor, parking_spaces,
                  available_from, permission_date, simple_description, description,
                  maintenance_cost, room_cnt, bathroom_cnt, direction,
                  verified, registry_paid, discussable, discuss_detail,
                  reviewable, is_phone_public, created_at, updated_at)
SELECT 9,
       1,
       'OFFICETEL',
       'ON_SALE',
       '1146-2004-174942',
       1970000,
       710000,
       42.77,
       41.24,
       136,
       '5층',
       20,
       1,
       '2025-05-13',
       '2017-04-12',
       '학세권 투룸',
       '학교와 도서관 인근, 학생 또는 교직원 추천',
       5,
       2,
       2,
       'NORTH',
       TRUE,
       TRUE,
       TRUE,
       '임대 조건 협의 가능',
       TRUE,
       FALSE,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM room WHERE room_id = 9);



INSERT INTO options (room_id, option_name)
SELECT 9, 'AIR_CONDITIONER'
WHERE NOT EXISTS (SELECT 1 FROM options WHERE room_id = 9 AND option_name = 'AIR_CONDITIONER');

INSERT INTO maintenance_include (room_id, maintenance_include_name)
SELECT 9, 'WATER'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_include WHERE room_id = 9 AND maintenance_include_name = 'WATER');

INSERT INTO address (room_id, name, address_detail, postal_code, lat, lng, province, city, district)
SELECT 9,
       '대구광역시 수성구 봉은사로 134',
       '101동 369호',
       '07626',
       35.2773,
       126.8545,
       '대구광역시',
       '수성구',
       '범어동'
WHERE NOT EXISTS (SELECT 1 FROM address WHERE room_id = 9);

-- Rewritten image inserts
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (1, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room1.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (1, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room2.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (1, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room3.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (2, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room4.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (2, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room5.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (2, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room6.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (3, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room7.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (3, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room8.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (3, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room9.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (4, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room10.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (4, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room11.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (4, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room12.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (5, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room13.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (5, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room14.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (5, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room15.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (6, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room16.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (6, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room17.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (6, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room18.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (7, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room19.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (7, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room20.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (7, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room21.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (8, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room22.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (8, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room23.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (8, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room24.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (9, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room25.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (9, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room26.webp', NOW(), NOW());
INSERT INTO image (room_id, image_url, created_at, updated_at)
VALUES (9, 'https://bangjwo-s3.s3.ap-northeast-2.amazonaws.com/room2/room27.webp', NOW(), NOW());
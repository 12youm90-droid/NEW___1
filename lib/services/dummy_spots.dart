import '../models/spot.dart';

class DummySpots {
  static final spots = <Spot>[
    Spot(
      id: 's1',
      name: '숨은 언덕 전망대',
      description: '작은 언덕 위의 감성 전망대. 노을이 예쁜 곳.',
      lat: 37.5665,
      lng: 126.9780,
      tags: ['#노을', '#언덕', '#야경'],
      imageUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
      tips: ['광각 추천', '골든아워에 방문하면 예쁨', '사람이 적은 동쪽 게이트 이용'],
      bestTimes: ['17:30-18:15', '06:00-07:00'],
    ),
    Spot(
      id: 's2',
      name: '낡은 카페 골목',
      description: '빈티지 감성의 골목 카페들, 포토스팟이 곳곳에 있음.',
      lat: 37.5700,
      lng: 126.9820,
      tags: ['#감성카페', '#빈티지', '#골목'],
      imageUrl:
          'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=1200',
      tips: ['중간 조리개(ƒ/5.6)로 배경 흐림 추천', '카페 사장님께 양해 구하기'],
      bestTimes: ['10:00-13:00', '15:00-17:00'],
    ),
    Spot(
      id: 's3',
      name: '한적한 강변 산책로',
      description: '사람이 적고 강변 뷰가 좋은 포인트.',
      lat: 37.5651,
      lng: 126.9895,
      tags: ['#자연', '#산책로', '#강변'],
      imageUrl:
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
      tips: ['삼각대 지참 추천', '황혼 시간대에 분위기 좋음'],
      bestTimes: ['18:00-19:00', '06:00-07:30'],
    ),
  ];
}

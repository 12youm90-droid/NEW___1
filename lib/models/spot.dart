class Spot {
  final String id;
  final String name;
  final String description;
  final double lat;
  final double lng;
  final List<String> tags;
  final String imageUrl;
  final List<String> tips;
  final List<String> bestTimes;

  Spot({
    required this.id,
    required this.name,
    required this.description,
    required this.lat,
    required this.lng,
    required this.tags,
    required this.imageUrl,
    required this.tips,
    required this.bestTimes,
  });
}

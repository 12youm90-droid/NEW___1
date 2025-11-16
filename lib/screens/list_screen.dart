import 'package:flutter/material.dart';
import '../models/spot.dart';
import '../services/dummy_spots.dart';
import '../widgets/spot_card.dart';
import 'detail_screen.dart';

class ListScreen extends StatefulWidget {
  const ListScreen({super.key});

  @override
  State<ListScreen> createState() => _ListScreenState();
}

class _ListScreenState extends State<ListScreen> {
  final List<Spot> spots = DummySpots.spots;
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final filtered = spots.where((s) {
      final q = _query.trim().toLowerCase();
      if (q.isEmpty) return true;
      if (s.name.toLowerCase().contains(q)) return true;
      if (s.description.toLowerCase().contains(q)) return true;
      if (s.tags.join(' ').toLowerCase().contains(q)) return true;
      return false;
    }).toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: TextField(
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: '장소명/태그로 검색 (예: #야경)'),
            onChanged: (v) => setState(() => _query = v),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: filtered.length,
            itemBuilder: (context, index) {
              final spot = filtered[index];
              return GestureDetector(
                onTap: () {
                  Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => DetailScreen(spot: spot),
                  ));
                },
                child: SpotCard(spot: spot),
              );
            },
          ),
        ),
      ],
    );
  }
}

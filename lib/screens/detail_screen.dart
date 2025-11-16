import 'package:flutter/material.dart';
import '../models/spot.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../services/firestore_service.dart';
import 'package:async/async.dart';
import '../widgets/favorite_button.dart';

class DetailScreen extends StatelessWidget {
  final Spot spot;
  const DetailScreen({super.key, required this.spot});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(spot.name)),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              height: 250,
              child: CachedNetworkImage(
                imageUrl: spot.imageUrl,
                fit: BoxFit.cover,
                placeholder: (context, url) => const Center(child: CircularProgressIndicator()),
                errorWidget: (context, url, error) => const Icon(Icons.broken_image),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(spot.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(spot.description),
                  const SizedBox(height: 12),
                  const Text('촬영 팁', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  ...spot.tips.map((t) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Text('• $t'),
                      )),
                  const SizedBox(height: 12),
                  const Text('추천 시간대', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text(spot.bestTimes.join(', ')),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: spot.tags.map((t) => Chip(label: Text(t))).toList(),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      // 추후: 지도에서 위치 표시 또는 외부 맵 호출
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('지도에서 보기 기능은 추후 구현됩니다.')));
                    },
                    icon: const Icon(Icons.map),
                    label: const Text('지도에서 보기'),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton.icon(
                    onPressed: () async {
                      final picker = ImagePicker();
                      final picked = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1600);
                      if (picked == null) return;
                      final file = File(picked.path);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('업로드 중...')));
                      try {
                        final url = await FirestoreService().uploadPhoto(file, spot.id);
                        await FirestoreService().addReview(spot.id, {
                          'type': 'photo',
                          'url': url,
                          'createdAt': FieldValue.serverTimestamp(),
                        });
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('업로드 완료')));
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('업로드 실패: $e')));
                      }
                    },
                    icon: const Icon(Icons.upload),
                    label: const Text('사진 업로드'),
                  ),
                  const SizedBox(height: 8),
                  FavoriteButton(spotId: spot.id),
                  const SizedBox(height: 12),
                  const Text('리뷰', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ReviewForm(spotId: spot.id),
                  const SizedBox(height: 8),
                  ReviewsList(spotId: spot.id),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ReviewForm extends StatefulWidget {
  final String spotId;
  const ReviewForm({super.key, required this.spotId});

  @override
  State<ReviewForm> createState() => _ReviewFormState();
}

class _ReviewFormState extends State<ReviewForm> {
  final _controller = TextEditingController();
  bool _submitting = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(controller: _controller, decoration: const InputDecoration(hintText: '이용 후기나 팁을 남겨보세요')),
        const SizedBox(height: 6),
        Row(
          children: [
            ElevatedButton(
              onPressed: _submitting
                  ? null
                  : () async {
                      if (_controller.text.trim().isEmpty) return;
                      setState(() => _submitting = true);
                      await FirestoreService().addReview(widget.spotId, {
                        'type': 'text',
                        'text': _controller.text.trim(),
                        'createdAt': FieldValue.serverTimestamp(),
                      });
                      _controller.clear();
                      setState(() => _submitting = false);
                    },
              child: const Text('등록'),
            ),
          ],
        )
      ],
    );
  }
}

class ReviewsList extends StatelessWidget {
  final String spotId;
  const ReviewsList({super.key, required this.spotId});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: FirestoreService().reviewsStream(spotId),
      builder: (context, snap) {
        if (!snap.hasData) return const SizedBox.shrink();
        final items = snap.data!;
        return Column(
          children: items.map((r) {
            if (r['type'] == 'photo') {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Image.network(r['url'], height: 120, fit: BoxFit.cover),
              );
            }
            return ListTile(title: Text(r['text'] ?? ''), subtitle: const Text('사용자 후기'));
          }).toList(),
        );
      },
    );
  }
}

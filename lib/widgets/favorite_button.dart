import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class FavoriteButton extends StatefulWidget {
  final String spotId;
  const FavoriteButton({super.key, required this.spotId});

  @override
  State<FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends State<FavoriteButton> {
  bool _isFav = false;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final f = await FirestoreService().isFavorite(widget.spotId);
    setState(() {
      _isFav = f;
      _loading = false;
    });
  }

  Future<void> _toggle() async {
    setState(() => _loading = true);
    await FirestoreService().toggleFavorite(widget.spotId, !_isFav);
    setState(() {
      _isFav = !_isFav;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: _loading ? null : _toggle,
      icon: Icon(_isFav ? Icons.favorite : Icons.favorite_border, color: Colors.redAccent),
    );
  }
}

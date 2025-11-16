import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/spot.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;

  Future<String> uploadPhoto(File file, String spotId) async {
    final uid = FirebaseAuth.instance.currentUser?.uid ?? 'anon';
    final ref = _storage.ref().child('spot_photos/$spotId/$uid-${DateTime.now().millisecondsSinceEpoch}.jpg');
    final uploadTask = await ref.putFile(file);
    return await ref.getDownloadURL();
  }

  Future<void> addReview(String spotId, Map<String, dynamic> review) async {
    await _db.collection('spots').doc(spotId).collection('reviews').add(review);
  }

  Stream<List<Map<String, dynamic>>> reviewsStream(String spotId) {
    return _db.collection('spots').doc(spotId).collection('reviews').orderBy('createdAt', descending: true).snapshots().map(
          (snap) => snap.docs.map((d) => d.data()).toList(),
        );
  }

  Future<void> toggleFavorite(String spotId, bool fav) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;
    final ref = _db.collection('users').doc(uid).collection('favorites').doc(spotId);
    if (fav) {
      await ref.set({'spotId': spotId, 'savedAt': FieldValue.serverTimestamp()});
    } else {
      await ref.delete();
    }
  }

  Future<bool> isFavorite(String spotId) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return false;
    final doc = await _db.collection('users').doc(uid).collection('favorites').doc(spotId).get();
    return doc.exists;
  }
}

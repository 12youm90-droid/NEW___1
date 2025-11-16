import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  Future<void> init() async {
    await Firebase.initializeApp();
    await _ensureAnonymousSignIn();
  }

  Future<void> _ensureAnonymousSignIn() async {
    final auth = FirebaseAuth.instance;
    if (auth.currentUser == null) {
      try {
        await auth.signInAnonymously();
      } catch (e) {
        debugPrint('Anonymous sign-in failed: $e');
      }
    }
  }

  User? get currentUser => FirebaseAuth.instance.currentUser;
}

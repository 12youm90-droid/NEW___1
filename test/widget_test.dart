import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:photo_spots_app/main.dart' as app;

void main() {
  testWidgets('App shows Hello, Flutter!', (WidgetTester tester) async {
    await tester.pumpWidget(const app.MyApp());
    expect(find.text('Hello, Flutter!'), findsOneWidget);
  });
}

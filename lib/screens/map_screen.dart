import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/spot.dart';
import '../services/dummy_spots.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GoogleMapController? _controller;
  final List<Spot> spots = DummySpots.spots;

  static const CameraPosition _initialCamera = CameraPosition(
    target: LatLng(37.5665, 126.9780),
    zoom: 13,
  );

  @override
  Widget build(BuildContext context) {
    final markers = spots
        .map((s) => Marker(
              markerId: MarkerId(s.id),
              position: LatLng(s.lat, s.lng),
              infoWindow: InfoWindow(title: s.name, snippet: s.tags.join(' ')),
            ))
        .toSet();

    return GoogleMap(
      initialCameraPosition: _initialCamera,
      markers: markers,
      onMapCreated: (controller) => _controller = controller,
      myLocationEnabled: false,
    );
  }
}

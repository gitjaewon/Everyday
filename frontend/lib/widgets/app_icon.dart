import 'dart:typed_data';
import 'package:flutter/material.dart';

/// Icons8에서 받은 PNG 아이콘을 보여주는 공용 위젯.
/// assets/icons/ 안에 파일이 있으면 그걸 쓰고, 없으면 기본 Material 아이콘으로 자동 대체돼요.
class AppIcon extends StatelessWidget {
  final String assetName;
  final IconData fallback;
  final double size;

  const AppIcon(
    this.assetName, {
    super.key,
    required this.fallback,
    this.size = 24,
  });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ByteData>(
      future: DefaultAssetBundle.of(context).load('assets/icons/$assetName'),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done && snapshot.hasData) {
          return Image.asset('assets/icons/$assetName', width: size, height: size);
        }
        return Icon(fallback, size: size);
      },
    );
  }
}
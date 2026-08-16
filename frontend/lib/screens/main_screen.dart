import 'package:flutter/material.dart';
import 'home_screen.dart';

/// 로그인 후 진입하는 첫 화면.
/// 실제 내용(홈 메뉴)은 HomeScreen에 있고, 여기서는 그대로 보여주기만 해요.
/// (login_screen.dart, main.dart에서 MainScreen을 그대로 참조하고 있어서
/// 이 파일 이름과 클래스명은 유지했어요.)
class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const HomeScreen();
  }
}
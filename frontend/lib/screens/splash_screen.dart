import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';

/// 피그마 "시작 화면"(스플래시) 디자인을 그대로 옮긴 화면이에요.
/// 아직 앱 흐름(_StartupGate 등)에는 연결 안 했어요 — 화면 자체만 먼저
/// 확인해보시라고 만들어둔 거예요. 연결은 다음 단계에서 같이 정해요.
///
/// 시작하기 전에 터미널에서 패키지 두 개를 추가해주세요:
///   flutter pub add flutter_svg google_fonts
///
/// 참고할 점:
/// - 로고 아이콘/워드마크는 피그마 MCP가 내려준 임시 URL을 쓰고 있어요
///   (7일 후 만료). 실제로 화면에 넣어 쓸 때는 피그마에서 이 두 에셋을
///   SVG로 내보내서 assets/images/ 같은 폴더에 넣고, 아래 SvgPicture.network를
///   SvgPicture.asset으로 바꿔주면 돼요.
/// - "시작하기" 버튼 텍스트는 디자인상 Pretendard SemiBold인데, 프로젝트에
///   아직 Pretendard 폰트 파일이 없어서 기본 폰트의 SemiBold 굵기로
///   대체해뒀어요. 나중에 Pretendard 폰트 파일을 pubspec.yaml에 등록하면
///   바로 교체할 수 있게 구조는 맞춰놨어요.
/// - 버튼 색상(#00A36F)은 실제 컴포넌트에서 나온 정확한 값이에요.
///   기존 main.dart의 AppColors.primary500(#0FAE7A)이랑 살짝 다른데,
///   이건 다음에 AppColors 쪽을 업데이트할 때 같이 맞추면 좋을 것 같아요.
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  static const _logoIconUrl =
      'https://www.figma.com/api/mcp/asset/6031d3e6-0e0f-49f6-9a27-49cb22746ccc.svg';
  static const _logoWordmarkUrl =
      'https://www.figma.com/api/mcp/asset/fb84a206-428a-45ac-91bb-76d7fdbd4da3.svg';
  static const _startButtonColor = Color(0xFF00A36F);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F5F7),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const Spacer(flex: 3),
              SvgPicture.network(
                _logoIconUrl,
                width: 100,
                height: 132,
              ),
              const SizedBox(height: 24),
              SvgPicture.network(
                _logoWordmarkUrl,
                width: 88,
                height: 43,
              ),
              const SizedBox(height: 16),
              Text(
                ': 나만의 하루의 결을 만들어가다',
                textAlign: TextAlign.center,
                style: GoogleFonts.gowunBatang(
                  fontSize: 20,
                  height: 1.2,
                  color: Colors.black,
                ),
              ),
              const Spacer(flex: 5),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: () {
                    // TODO: 다음 단계에서 온보딩/로그인 화면으로 연결
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _startButtonColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    '시작하기',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFFAFAF8),
                      letterSpacing: -0.72,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
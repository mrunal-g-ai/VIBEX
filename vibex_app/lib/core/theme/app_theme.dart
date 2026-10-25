import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// VIBEX Theme System — mirrors the React CSS design tokens exactly.
enum VibexTheme { obsidian, zen, arcade, nordic }

extension VibexThemeExtension on VibexTheme {
  String get displayName {
    switch (this) {
      case VibexTheme.obsidian:
        return 'Obsidian Studio';
      case VibexTheme.zen:
        return 'Warm Zen';
      case VibexTheme.arcade:
        return 'Neo-Arcade';
      case VibexTheme.nordic:
        return 'Nordic Slate';
    }
  }

  VibexColorScheme get colors {
    switch (this) {
      case VibexTheme.obsidian:
        return const VibexColorScheme(
          bgMain: Color(0xFF0A0B0D),
          bgCard: Color(0xFF0F1115),
          bgCardElevated: Color(0xFF1A1D23),
          accentPrimary: Color(0xFFE5C07B),
          accentSecondary: Color(0xFFB8914B),
          textPrimary: Color(0xFFFFFFFF),
          textMuted: Color(0xFFA1A1AA),
          borderSubtle: Color(0x1AFFFFFF),
          isDark: true,
        );
      case VibexTheme.zen:
        return const VibexColorScheme(
          bgMain: Color(0xFFFAF7F2),
          bgCard: Color(0xFFFFFFFF),
          bgCardElevated: Color(0xFFF3EDE2),
          accentPrimary: Color(0xFFC26715),
          accentSecondary: Color(0xFF9A4C08),
          textPrimary: Color(0xFF1C1917),
          textMuted: Color(0xFF78716C),
          borderSubtle: Color(0x261C1917),
          isDark: false,
        );
      case VibexTheme.arcade:
        return const VibexColorScheme(
          bgMain: Color(0xFF070A14),
          bgCard: Color(0xFF0F172A),
          bgCardElevated: Color(0xFF1E293B),
          accentPrimary: Color(0xFF10B981),
          accentSecondary: Color(0xFF06B6D4),
          textPrimary: Color(0xFFF8FAFC),
          textMuted: Color(0xFF94A3B8),
          borderSubtle: Color(0x3310B981),
          isDark: true,
        );
      case VibexTheme.nordic:
        return const VibexColorScheme(
          bgMain: Color(0xFF0B1120),
          bgCard: Color(0xFF111827),
          bgCardElevated: Color(0xFF1F2937),
          accentPrimary: Color(0xFF38BDF8),
          accentSecondary: Color(0xFF2563EB),
          textPrimary: Color(0xFFF1F5F9),
          textMuted: Color(0xFF94A3B8),
          borderSubtle: Color(0x2E38BDF8),
          isDark: true,
        );
    }
  }

  List<Color> get paletteColors {
    final c = colors;
    return [c.bgMain, c.accentPrimary, c.accentSecondary];
  }
}

class VibexColorScheme {
  final Color bgMain;
  final Color bgCard;
  final Color bgCardElevated;
  final Color accentPrimary;
  final Color accentSecondary;
  final Color textPrimary;
  final Color textMuted;
  final Color borderSubtle;
  final bool isDark;

  const VibexColorScheme({
    required this.bgMain,
    required this.bgCard,
    required this.bgCardElevated,
    required this.accentPrimary,
    required this.accentSecondary,
    required this.textPrimary,
    required this.textMuted,
    required this.borderSubtle,
    required this.isDark,
  });
}

class AppTheme {
  static ThemeData buildTheme(VibexTheme vibexTheme) {
    final c = vibexTheme.colors;

    final colorScheme = ColorScheme(
      brightness: c.isDark ? Brightness.dark : Brightness.light,
      primary: c.accentPrimary,
      onPrimary: c.isDark ? Colors.black : Colors.white,
      secondary: c.accentSecondary,
      onSecondary: Colors.white,
      surface: c.bgCard,
      onSurface: c.textPrimary,
      error: const Color(0xFFEF4444),
      onError: Colors.white,
    );

    final textTheme = GoogleFonts.plusJakartaSansTextTheme(
      TextTheme(
        displayLarge: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w800, letterSpacing: -1.5),
        displayMedium: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w700),
        displaySmall: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w700),
        headlineLarge: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w700),
        headlineMedium: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w600),
        headlineSmall: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w600),
        titleLarge: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w600),
        titleMedium: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w500),
        titleSmall: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w500),
        bodyLarge: TextStyle(color: c.textPrimary),
        bodyMedium: TextStyle(color: c.textMuted),
        bodySmall: TextStyle(color: c.textMuted, fontSize: 12),
        labelLarge: TextStyle(color: c.textPrimary, fontWeight: FontWeight.w700, letterSpacing: 0.5),
        labelSmall: TextStyle(color: c.textMuted, letterSpacing: 0.8),
      ),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: c.bgMain,
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: c.bgMain.withAlpha(242),
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: c.textPrimary),
        titleTextStyle: GoogleFonts.plusJakartaSans(
          color: c.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: CardThemeData(
        color: c.bgCard,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: c.borderSubtle, width: 1),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: c.bgCard,
        indicatorColor: c.accentPrimary.withAlpha(30),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return TextStyle(color: c.accentPrimary, fontSize: 11, fontWeight: FontWeight.w700);
          }
          return TextStyle(color: c.textMuted, fontSize: 11);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return IconThemeData(color: c.accentPrimary, size: 24);
          }
          return IconThemeData(color: c.textMuted, size: 24);
        }),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: c.bgCardElevated,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: c.borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: c.borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: c.accentPrimary, width: 1.5),
        ),
        hintStyle: TextStyle(color: c.textMuted),
        labelStyle: TextStyle(color: c.textMuted),
      ),
      dividerTheme: DividerThemeData(color: c.borderSubtle, space: 1),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: c.accentPrimary,
          foregroundColor: c.isDark ? Colors.black : Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          elevation: 0,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: c.textPrimary,
          side: BorderSide(color: c.borderSubtle),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
        ),
      ),
    );
  }
}

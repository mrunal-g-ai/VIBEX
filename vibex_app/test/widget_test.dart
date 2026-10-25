import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vibex_app/data/providers/app_providers.dart';
import 'package:vibex_app/main.dart';

void main() {
  testWidgets('VIBEX App smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({
      'vibex_onboarding_completed': true,
      'vibex_selected_instrument': 'guitar',
    });
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
        ],
        child: const VibexApp(),
      ),
    );

    await tester.pump();
    expect(find.text('VIBEX'), findsOneWidget);
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/curriculum_data.dart';
import '../../data/providers/app_providers.dart';
import '../../data/services/api_service.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final Exercise? suggestedExercise;

  const ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.suggestedExercise,
  });
}

class AIMentorScreen extends ConsumerStatefulWidget {
  final void Function(Exercise exercise)? onPracticeGeneratedExercise;

  const AIMentorScreen({
    super.key,
    this.onPracticeGeneratedExercise,
  });

  @override
  ConsumerState<AIMentorScreen> createState() => _AIMentorScreenState();
}

class _AIMentorScreenState extends ConsumerState<AIMentorScreen> {
  final TextEditingController _textCtrl = TextEditingController();
  final TextEditingController _drillTopicCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  bool _isLoading = false;
  bool _isGeneratingDrill = false;

  final List<ChatMessage> _messages = [
    ChatMessage(
      text:
          'Namaste! I am your VIBEX Virtual Maestro. Whether you need posture corrections, musical theory explanations, or customized practice drills, I am here to guide your musical journey.',
      isUser: false,
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
  ];

  static const Map<InstrumentType, List<String>> _instrumentPrompts = {
    InstrumentType.keyboard: [
      'How do I keep my wrists from collapsing during scale passages?',
      'What is the correct thumb under tuck technique for C major?',
      'How can I play with dynamic expression without tensing my shoulders?',
      'Generate a customized 5-finger speed independence drill for me.',
    ],
    InstrumentType.guitar: [
      'Why do my chords buzz even when I press hard?',
      'How should my left thumb be positioned behind the neck?',
      'How do I switch quickly between C Major and G Major chords?',
      'Generate a 3-minute finger dexterity exercise for frets 1 to 4.',
    ],
    InstrumentType.violin: [
      'Why is my tone raspy and scratchy near the bow frog?',
      'How do I keep the bow 90 degrees parallel to the bridge?',
      'How can I find accurate 1st and 3rd finger intonation without frets?',
      'Generate an intonation exercise for A and E string finger transitions.',
    ],
    InstrumentType.bansuri: [
      'Why does my low Sa sound airy or not sound at all?',
      'How do I seal the bamboo holes completely with flat finger pads?',
      'What is the difference between Shuddha and Teevra Ma in Raag Yaman?',
      'Generate an Indian Classical Alankar practice sequence for Sa-Re-Ga-Ma.',
    ],
  };

  Future<void> _sendMessage([String? presetText]) async {
    final query = presetText ?? _textCtrl.text.trim();
    if (query.isEmpty || _isLoading) return;

    if (presetText == null) {
      _textCtrl.clear();
    }

    setState(() {
      _messages.add(ChatMessage(
        text: query,
        isUser: true,
        timestamp: DateTime.now(),
      ));
      _isLoading = true;
    });

    _scrollToBottom();

    final instrument = ref.read(instrumentProvider);
    final api = ref.read(apiServiceProvider);

    final history = _messages.map((m) => {
      'role': m.isUser ? 'user' : 'assistant',
      'content': m.text,
    }).toList();

    final response = await api.sendMentorChat(
      instrument: instrument.displayName,
      message: query,
      history: history,
    );

    final reply = response['reply'];
    final error = response['error'];

    if (mounted) {
      setState(() {
        if (reply != null && reply is String && reply.isNotEmpty) {
          _messages.add(ChatMessage(
            text: reply,
            isUser: false,
            timestamp: DateTime.now(),
          ));
        } else {
          _messages.add(ChatMessage(
            text: '⚠️ AI Mentor Unavailable: ${error ?? "Could not reach Gemini service."}\n\nPlease verify that the backend server is running with a valid GEMINI_API_KEY or retry.',
            isUser: false,
            timestamp: DateTime.now(),
          ));
        }
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  Future<void> _generateDrill() async {
    final topic = _drillTopicCtrl.text.trim();
    if (topic.isEmpty || _isGeneratingDrill) return;

    setState(() {
      _isGeneratingDrill = true;
    });

    final instrument = ref.read(instrumentProvider);
    final api = ref.read(apiServiceProvider);

    final res = await api.generateDrill(
      instrument: instrument.displayName,
      skillArea: topic,
    );

    if (mounted) {
      setState(() {
        _isGeneratingDrill = false;
      });

      if (res['id'] != null) {
        final rawNotes = res['targetNotes'] as List<dynamic>? ?? [];
        final parsedNotes = rawNotes.map((n) {
          return TargetNote(
            note: n['note'] ?? 'C4',
            duration: (n['duration'] as num?)?.toDouble() ?? 1.0,
            fingerNumber: n['fingerNumber'] as int?,
            fret: n['fret'] as int?,
            string: n['string'] as int?,
          );
        }).toList();

        final generatedExercise = Exercise(
          id: res['id'] ?? 'gen_${DateTime.now().millisecondsSinceEpoch}',
          title: res['title'] ?? 'Custom $topic Drill',
          description: res['description'] ?? 'Targeted practice generated by Gemini AI.',
          instructions: res['instructions'] ?? 'Follow the visual notes and target pitches.',
          bpm: (res['bpm'] as num?)?.toInt() ?? 60,
          requiredPassingScore: (res['requiredPassingScore'] as num?)?.toInt() ?? 70,
          targetNotes: parsedNotes.isNotEmpty
              ? parsedNotes
              : [
                  const TargetNote(note: 'C4', duration: 1, fingerNumber: 1),
                  const TargetNote(note: 'D4', duration: 1, fingerNumber: 2),
                ],
        );

        setState(() {
          _messages.add(ChatMessage(
            text: '✨ I have synthesized a customized micro-drill for you: **${generatedExercise.title}**.\n\n*${generatedExercise.description}*',
            isUser: false,
            timestamp: DateTime.now(),
            suggestedExercise: generatedExercise,
          ));
          _drillTopicCtrl.clear();
        });
        _scrollToBottom();
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final instrument = ref.watch(instrumentProvider);
    final currentTheme = ref.watch(themeProvider);
    final colors = currentTheme.colors;
    final prompts = _instrumentPrompts[instrument] ?? _instrumentPrompts[InstrumentType.guitar]!;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWideScreen = constraints.maxWidth >= 900;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left Column: AI Micro-Drill Synthesizer (on wide screen)
            if (isWideScreen)
              SizedBox(
                width: 320,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 16, 0, 16),
                  child: Column(
                    children: [
                      _buildSynthesizerCard(colors),
                      const SizedBox(height: 16),
                      _buildInstantPromptsCard(prompts, colors),
                    ],
                  ),
                ),
              ),

            // Main Chat Stream (Right Column or full width)
            Expanded(
              child: Column(
                children: [
                  // AI Mentor Header Card
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    decoration: BoxDecoration(
                      color: colors.bgCard,
                      border: Border(bottom: BorderSide(color: colors.borderSubtle)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: LinearGradient(
                              colors: [colors.accentPrimary, colors.accentSecondary],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: colors.accentPrimary.withAlpha(80),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Icon(Icons.psychology, color: Colors.black, size: 26),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Text(
                                    'VIBEX AI Maestro',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: Color(0xFF10B981),
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                'Personalized tutor for ${instrument.displayName}',
                                style: TextStyle(color: colors.textMuted, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Horizontal prompt chips for narrow screen
                  if (!isWideScreen)
                    Container(
                      height: 46,
                      color: colors.bgCardElevated,
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        scrollDirection: Axis.horizontal,
                        itemCount: prompts.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final prompt = prompts[index];
                          return ActionChip(
                            label: Text(prompt),
                            backgroundColor: colors.bgCard,
                            labelStyle: TextStyle(
                              color: colors.accentPrimary,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                            side: BorderSide(color: colors.borderSubtle),
                            onPressed: () => _sendMessage(prompt),
                          );
                        },
                      ),
                    ),

                  // Messages list
                  Expanded(
                    child: ListView.builder(
                      controller: _scrollCtrl,
                      padding: const EdgeInsets.all(16),
                      itemCount: _messages.length,
                      itemBuilder: (context, index) {
                        final msg = _messages[index];
                        return _buildChatBubble(msg, colors);
                      },
                    ),
                  ),

                  if (_isLoading)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: colors.accentPrimary),
                          ),
                          const SizedBox(width: 12),
                          Text('Maestro is thinking...', style: TextStyle(color: colors.textMuted, fontSize: 12)),
                        ],
                      ),
                    ),

                  // Bottom Input Field
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: colors.bgCard,
                      border: Border(top: BorderSide(color: colors.borderSubtle)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _textCtrl,
                            style: TextStyle(color: colors.textPrimary, fontSize: 13),
                            decoration: InputDecoration(
                              hintText: 'Ask about posture, fingerings, Indian Swaras...',
                              hintStyle: TextStyle(color: colors.textMuted, fontSize: 13),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              filled: true,
                              fillColor: colors.bgCardElevated,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(100),
                                borderSide: BorderSide.none,
                              ),
                            ),
                            onSubmitted: (_) => _sendMessage(),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: colors.accentPrimary,
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.send_rounded, color: Colors.black, size: 18),
                            onPressed: () => _sendMessage(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildSynthesizerCard(VibexColorScheme colors) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: colors.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.auto_awesome, color: colors.accentPrimary, size: 16),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'AI MICRO-DRILL SYNTHESIZER',
                  style: TextStyle(
                    color: colors.accentPrimary,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Specify a chord transition or swara drill and AI will synthesize an interactive module.',
            style: TextStyle(color: colors.textMuted, fontSize: 11, height: 1.4),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _drillTopicCtrl,
            style: TextStyle(color: colors.textPrimary, fontSize: 12),
            decoration: InputDecoration(
              hintText: 'e.g. Switching C to G chord...',
              hintStyle: TextStyle(color: colors.textMuted, fontSize: 11),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              filled: true,
              fillColor: colors.bgCardElevated,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: colors.borderSubtle),
              ),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isGeneratingDrill ? null : _generateDrill,
              icon: _isGeneratingDrill
                  ? const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                    )
                  : const Icon(Icons.bolt, size: 16),
              label: Text(_isGeneratingDrill ? 'Synthesizing...' : 'SYNTHESIZE DRILL'),
              style: ElevatedButton.styleFrom(
                backgroundColor: colors.accentPrimary,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 10),
                textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInstantPromptsCard(List<String> prompts, VibexColorScheme colors) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: colors.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lightbulb_outline_rounded, color: colors.accentPrimary, size: 16),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'INSTANT MAESTRO PROMPTS',
                  style: TextStyle(
                    color: colors.accentPrimary,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...prompts.map((p) {
            return Container(
              margin: const EdgeInsets.only(bottom: 6),
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => _sendMessage(p),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: colors.borderSubtle),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  alignment: Alignment.centerLeft,
                ),
                child: Text(
                  p,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: colors.textPrimary, fontSize: 11),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildChatBubble(ChatMessage msg, VibexColorScheme colors) {
    final isUser = msg.isUser;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [colors.accentPrimary, colors.accentSecondary],
                ),
              ),
              child: const Icon(Icons.psychology, size: 18, color: Colors.black),
            ),
            const SizedBox(width: 10),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isUser ? colors.accentPrimary : colors.bgCardElevated,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: isUser ? Colors.transparent : colors.borderSubtle,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    msg.text,
                    style: TextStyle(
                      color: isUser ? Colors.black : colors.textPrimary,
                      fontSize: 13,
                      height: 1.45,
                    ),
                  ),

                  // If suggested drill is present, show interactive launch button!
                  if (msg.suggestedExercise != null && widget.onPracticeGeneratedExercise != null) ...[
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: () => widget.onPracticeGeneratedExercise!(msg.suggestedExercise!),
                      icon: const Icon(Icons.play_arrow_rounded, size: 16),
                      label: const Text('LAUNCH INTERACTIVE DRILL'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: colors.accentPrimary,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 10),
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: colors.bgCardElevated,
                border: Border.all(color: colors.borderSubtle),
              ),
              child: const Icon(Icons.person, size: 18, color: Colors.white70),
            ),
          ],
        ],
      ),
    );
  }
}

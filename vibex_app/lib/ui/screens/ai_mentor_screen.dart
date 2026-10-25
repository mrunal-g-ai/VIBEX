import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/providers/app_providers.dart';
import '../../data/services/api_service.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  const ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
  });
}

class AIMentorScreen extends ConsumerStatefulWidget {
  const AIMentorScreen({super.key});

  @override
  ConsumerState<AIMentorScreen> createState() => _AIMentorScreenState();
}

class _AIMentorScreenState extends ConsumerState<AIMentorScreen> {
  final TextEditingController _textCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  bool _isLoading = false;

  final List<ChatMessage> _messages = [
    ChatMessage(
      text:
          'Namaste! I am your VIBEX Virtual Maestro. Whether you need posture corrections, musical theory explanations, or customized practice drills, I am here to guide your musical journey.',
      isUser: false,
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
  ];

  static const List<String> _quickPrompts = [
    'How do I stop fret buzz?',
    'Explain Swara Sa Re Ga vs Western Notes',
    'How should my thumb be placed?',
    'Give me a 5-minute warm-up routine',
    'How to improve rhythm and timing consistency?',
  ];

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

    return Column(
      children: [
        // AI Mentor Header Card
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: const BoxDecoration(
            color: Color(0xFF131722),
            border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [Color(0xFFE5C07B), Color(0xFFB8914B)],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFE5C07B).withAlpha(80),
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
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Quick Prompt Chips
        Container(
          height: 46,
          color: const Color(0xFF0F1219),
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            scrollDirection: Axis.horizontal,
            itemCount: _quickPrompts.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final prompt = _quickPrompts[index];
              return ActionChip(
                label: Text(prompt),
                backgroundColor: const Color(0xFF161B26),
                labelStyle: const TextStyle(
                  color: Color(0xFFE5C07B),
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
                side: const BorderSide(color: Color(0xFF2E384D)),
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
              return _buildChatBubble(msg);
            },
          ),
        ),

        if (_isLoading)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              children: const [
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFE5C07B)),
                ),
                SizedBox(width: 12),
                Text('Maestro is thinking...', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
              ],
            ),
          ),

        // Input Field Bar
        Container(
          padding: const EdgeInsets.all(12),
          decoration: const BoxDecoration(
            color: Color(0xFF131722),
            border: Border(top: BorderSide(color: Color(0xFF1E293B))),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _textCtrl,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Ask Maestro anything about ${instrument.displayName}...',
                    hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    filled: true,
                    fillColor: const Color(0xFF0A0C12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: const BorderSide(color: Color(0xFF1E293B)),
                    ),
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFFE5C07B),
                ),
                child: IconButton(
                  icon: const Icon(Icons.send, color: Colors.black, size: 20),
                  onPressed: () => _sendMessage(),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildChatBubble(ChatMessage msg) {
    return Align(
      alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: msg.isUser ? const Color(0xFFE5C07B) : const Color(0xFF161B26),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(msg.isUser ? 16 : 4),
            bottomRight: Radius.circular(msg.isUser ? 4 : 16),
          ),
          border: Border.all(
            color: msg.isUser ? const Color(0xFFFBBF24) : const Color(0xFF2E384D),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(50),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Text(
          msg.text,
          style: TextStyle(
            color: msg.isUser ? Colors.black : const Color(0xFFF1F5F9),
            fontSize: 14,
            height: 1.45,
          ),
        ),
      ),
    );
  }
}

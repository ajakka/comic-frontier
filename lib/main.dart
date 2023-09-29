import 'dart:io';

import 'package:system_theme/system_theme.dart';

import 'package:fluent_ui/fluent_ui.dart';

import 'package:comic_frontiers/feature/reader/android.dart';
import 'package:comic_frontiers/feature/reader/windows.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(const ComicFrontiersApp());
}

class ComicFrontiersApp extends StatelessWidget {
  const ComicFrontiersApp({super.key});

  @override
  Widget build(BuildContext context) {

    return MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Comic Frontiers',
        theme: ThemeData(
          colorScheme:
              ColorScheme.fromSeed(seedColor: SystemTheme.accentColor.accent),
        ),
        home: const ReaderAnd(title: 'Comic Frontiers'),
      );
      
    // ANDROID
    if (Platform.isAndroid) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Comic Frontiers',
        theme: ThemeData(
          colorScheme:
              ColorScheme.fromSeed(seedColor: SystemTheme.accentColor.accent),
        ),
        home: const ReaderAnd(title: 'Comic Frontiers'),
      );
    }

    // WINDOWS
    else if (Platform.isWindows) {
      return FluentApp(
        debugShowCheckedModeBanner: false,
        home: NavigationView(
          content: CommandBar(
            crossAxisAlignment: CrossAxisAlignment.start,
            direction: Axis.horizontal,
            overflowBehavior: CommandBarOverflowBehavior.noWrap,
            primaryItems: [
              CommandBarButton(
                icon: const Icon(FluentIcons.add),
                label: const Text('New'),
                onPressed: () {},
              ),
              CommandBarButton(
                icon: const Icon(FluentIcons.delete),
                label: const Text('Delete'),
                onPressed: () {},
              ),
              CommandBarButton(
                icon: const Icon(FluentIcons.archive),
                label: const Text('Archive'),
                onPressed: () {},
              ),
              CommandBarButton(
                icon: const Icon(FluentIcons.move),
                label: const Text('Move'),
                onPressed: () {},
              ),
              const CommandBarButton(
                icon: Icon(FluentIcons.cancel),
                label: Text('Disabled'),
                onPressed: null,
              ),
            ],
          ),
        ),
      );
    }

    // OTHER
    else {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Comic Frontiers',
        theme: ThemeData(
          colorScheme:
              ColorScheme.fromSeed(seedColor: SystemTheme.accentColor.accent),
        ),
        home: const ReaderAnd(title: 'Comic Frontiers'),
      );
    }
  }
}

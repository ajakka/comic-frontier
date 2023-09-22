import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:archive/archive.dart';

import 'package:file_picker/file_picker.dart';

class ReaderAnd extends StatefulWidget {
  const ReaderAnd({super.key, required this.title});

  final String title;

  @override
  State<ReaderAnd> createState() => _ReaderStateAnd();
}

class _ReaderStateAnd extends State<ReaderAnd> {
  List<Uint8List>? _images;
  int _currentIndex = 0;
  BoxFit _currentFit = BoxFit.fitHeight;
  final FocusNode _focusNode = FocusNode();
  final ScrollController _scrollController = ScrollController();

  void _pickAndExtractFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['cbz', 'zip'],
    );

    if (result != null) {
      Uint8List fileBytes;

      if (kIsWeb) {
        // For web, get the bytes directly
        fileBytes = result.files.first.bytes!;
      } else {
        // For mobile platforms, read from the file path
        File file = File(result.files.single.path!);
        fileBytes = file.readAsBytesSync();
      }

      List<Uint8List> images = [];
      final archive = ZipDecoder().decodeBytes(fileBytes);

      for (var file in archive) {
        if (file.isFile) {
          if (file.name.toLowerCase().endsWith('.png') ||
              file.name.toLowerCase().endsWith('.jpg') ||
              file.name.toLowerCase().endsWith('.jpeg')) {
            images.add(file.content as Uint8List);
          }
        }
      }

      setState(() {
        _images = images;
        _currentIndex = 0;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: <Widget>[
          IconButton(
            icon: const Icon(Icons.photo_size_select_large),
            onPressed: () {
              setState(() {
                _currentFit = BoxFit.fitWidth;
              });
            },
            tooltip: 'Fit Width',
          ),
          IconButton(
            icon: const Icon(Icons.photo_size_select_small),
            onPressed: () {
              setState(() {
                _currentFit = BoxFit.fitHeight;
              });
            },
            tooltip: 'Fit Height',
          ),
        ],
      ),
      body: FocusScope(
          child: RawKeyboardListener(
        focusNode: _focusNode,
        autofocus: true,
        onKey: (RawKeyEvent event) {
          if (event is RawKeyDownEvent) {
            if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
              _scrollController.animateTo(_scrollController.offset - 64,
                  duration: const Duration(milliseconds: 64),
                  curve: Curves.easeOut);
            } else if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
              _scrollController.animateTo(_scrollController.offset + 64,
                  duration: const Duration(milliseconds: 64),
                  curve: Curves.easeOut);
            } else if (event.logicalKey == LogicalKeyboardKey.arrowRight &&
                _currentIndex < (_images?.length ?? 0) - 1) {
              setState(() {
                _currentIndex++;
              });
            } else if (event.logicalKey == LogicalKeyboardKey.arrowLeft &&
                _currentIndex > 0) {
              setState(() {
                _currentIndex--;
              });
            }
          }
        },
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              _images == null || _images!.isEmpty
                  ? const Text('No images selected.')
                  : Expanded(
                      child: Builder(
                        builder: (context) {
                          if (_currentFit == BoxFit.fitWidth) {
                            return SingleChildScrollView(
                              controller: _scrollController,
                              scrollDirection: Axis.vertical,
                              child: Container(
                                  width: MediaQuery.of(context).size.width,
                                  decoration:
                                      const BoxDecoration(color: Colors.white),
                                  child: Image.memory(_images![_currentIndex],
                                      fit: _currentFit)),
                            );
                          } else {
                            return SingleChildScrollView(
                              controller: _scrollController,
                              scrollDirection: Axis.horizontal,
                              child: SizedBox(
                                height: MediaQuery.of(context).size.height -
                                    AppBar().preferredSize.height -
                                    MediaQuery.of(context)
                                        .padding
                                        .top, // Subtracting AppBar height and padding
                                child: Image.memory(_images![_currentIndex],
                                    fit: _currentFit),
                              ),
                            );
                          }
                        },
                      ),
                    ),
            ],
          ),
        ),
      )),
      floatingActionButton: FloatingActionButton(
        onPressed: _pickAndExtractFile,
        tooltip: 'Pick CBZ/ZIP File',
        child: const Icon(Icons.folder_open),
      ),
    );
  }
}

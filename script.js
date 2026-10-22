document.addEventListener('DOMContentLoaded', function () {

    var toastBox = document.getElementById('toastNotification');
    var toastTimeout;

    function showToast(message, duration) {
        if (!toastBox) return;
        duration = duration || 3000;
        clearTimeout(toastTimeout);
        toastBox.textContent = message;
        toastBox.classList.add('show');
        toastTimeout = setTimeout(function () {
            toastBox.classList.remove('show');
        }, duration);
    }

    var darkToggle = document.getElementById('darkToggle');
    var savedTheme = localStorage.getItem('kintsu_theme');

    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark');
        document.documentElement.classList.add('dark');
    }

    if (darkToggle) {
        darkToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark');
            document.documentElement.classList.toggle('dark');
            var isDark = document.body.classList.contains('dark');
            localStorage.setItem('kintsu_theme', isDark ? 'dark' : 'light');
            showToast(isDark ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️', 1800);
        });
    }

    var selectableText = document.getElementById('selectableText');
    var selectionPopup = document.getElementById('selectionPopup');
    var btnCreateFlashcard = document.getElementById('btnCreateFlashcard');
    var btnDismissFlashcard = document.getElementById('btnDismissFlashcard');
    var synthesisBanner = document.getElementById('synthesisBanner');
    var flashcardDeck = document.getElementById('flashcardDeck');

    var FULL_DEMO_TEXT = "Modern LLMs rely on Transformer self-attention to process entire sequences in parallel. Unlike sequential RNNs, Multi-Head Attention allows tokens to dynamically attend to contextual relationships across distant words. Scaled Dot-Product Attention computes query-key affinity scores normalized by the square root of the head dimension.";
    var DEFAULT_HIGHLIGHT = "Scaled Dot-Product Attention computes query-key affinity scores normalized by the square root of the head dimension.";

    var isUserInteracted = false;
    var autoDemoTimer = null;
    var autoStepTimeout = null;

    function renderDemoText(highlightPhrase) {
        if (!selectableText) return;
        selectableText.innerHTML = '';

        if (!highlightPhrase || !FULL_DEMO_TEXT.includes(highlightPhrase)) {
            selectableText.textContent = FULL_DEMO_TEXT;
            return;
        }

        var idx = FULL_DEMO_TEXT.indexOf(highlightPhrase);
        var beforeText = FULL_DEMO_TEXT.substring(0, idx);
        var afterText = FULL_DEMO_TEXT.substring(idx + highlightPhrase.length);

        if (beforeText) {
            selectableText.appendChild(document.createTextNode(beforeText));
        }

        var mark = document.createElement('mark');
        mark.className = 'demo-highlight-mark';
        mark.id = 'interactiveMark';
        mark.textContent = highlightPhrase;
        mark.title = 'Click to show flashcard prompt';
        mark.addEventListener('click', function (e) {
            e.stopPropagation();
            if (selectionPopup) {
                selectionPopup.classList.toggle('show');
            }
        });
        selectableText.appendChild(mark);

        if (afterText) {
            selectableText.appendChild(document.createTextNode(afterText));
        }
    }

    renderDemoText(DEFAULT_HIGHLIGHT);
    if (selectionPopup) {
        selectionPopup.classList.add('show');
    }

    function handleDemoSelection() {
        var sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;

        var selectedStr = sel.toString().trim();
        var normalized = selectedStr.replace(/\s+/g, ' ');

        if (normalized.length >= 6) {
            var matchIdx = FULL_DEMO_TEXT.indexOf(normalized);
            if (matchIdx !== -1) {
                isUserInteracted = true;
                clearTimeout(autoStepTimeout);
                clearInterval(autoDemoTimer);

                renderDemoText(normalized);
                if (selectionPopup) {
                    selectionPopup.classList.add('show');
                }
                sel.removeAllRanges();
            }
        }
    }

    if (selectableText) {
        selectableText.addEventListener('mouseup', handleDemoSelection);
        selectableText.addEventListener('touchend', handleDemoSelection);
    }

    if (btnDismissFlashcard) {
        btnDismissFlashcard.addEventListener('click', function (e) {
            e.stopPropagation();
            isUserInteracted = true;
            clearTimeout(autoStepTimeout);
            clearInterval(autoDemoTimer);
            if (selectionPopup) selectionPopup.classList.remove('show');
            renderDemoText(null); 
            showToast('Highlight dismissed', 1500);
        });
    }

    if (btnCreateFlashcard) {
        btnCreateFlashcard.addEventListener('click', function (e) {
            e.stopPropagation();
            isUserInteracted = true;
            clearTimeout(autoStepTimeout);
            clearInterval(autoDemoTimer);
            if (selectionPopup) selectionPopup.classList.remove('show');
            if (synthesisBanner) synthesisBanner.classList.add('active');

            showToast('Running AI recall synthesis…', 2000);

            setTimeout(function () {
                if (synthesisBanner) synthesisBanner.classList.remove('active');
                cycleCardDeck();
                showToast('✨ 3 Flashcards generated from lecture notes!', 3500);
            }, 1200);
        });
    }

    function runAutoDemoCycle() {
        if (isUserInteracted) return;
        renderDemoText(null);
        if (selectionPopup) selectionPopup.classList.remove('show');

        autoStepTimeout = setTimeout(function () {
            if (isUserInteracted) return;
            renderDemoText(DEFAULT_HIGHLIGHT);
            if (selectionPopup) selectionPopup.classList.remove('show');

            autoStepTimeout = setTimeout(function () {
                if (isUserInteracted) return;
                if (selectionPopup) selectionPopup.classList.remove('show');
                if (synthesisBanner) synthesisBanner.classList.add('active');

                autoStepTimeout = setTimeout(function () {
                    if (isUserInteracted) return;
                    if (synthesisBanner) synthesisBanner.classList.remove('active');
                    cycleCardDeck();
                }, 1400);
            }, 2000);
        }, 1200);
    }

    autoDemoTimer = setInterval(function () {
        if (!isUserInteracted) {
            runAutoDemoCycle();
        }
    }, 14000);

    var cards = Array.from(document.querySelectorAll('.flashcard-item'));
    var cardPositions = ['card-pos-1', 'card-pos-2', 'card-pos-3'];

    function cycleCardDeck() {
        if (!cards.length) return;

        cards.forEach(function (c) { c.classList.remove('flipped'); });

        var top = cards.shift();
        cards.push(top);

        cards.forEach(function (card, i) {
            card.className = 'flashcard-item ' + cardPositions[i];
        });
    }

    cards.forEach(function (card) {
        card.addEventListener('click', function () {
            if (card.classList.contains('card-pos-1')) {
                if (card.classList.contains('flipped')) {
                    cycleCardDeck();
                } else {
                    card.classList.add('flipped');
                }
            } else {
                while (!card.classList.contains('card-pos-1')) {
                    cycleCardDeck();
                }
            }
        });

        card.addEventListener('keydown', function (e) {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                card.click();
            }
        });
    });

    // YouTube Video Workspace & URL Embedding
    var ytUrlInput = document.getElementById('ytUrlInput');
    var btnEmbedVideo = document.getElementById('btnEmbedVideo');
    var ytVideoPlayer = document.getElementById('ytVideoPlayer');

    function extractYouTubeId(url) {
        if (!url) return null;
        var trimmed = url.trim();
        if (/^[\w-]{11}$/.test(trimmed)) {
            return trimmed;
        }
        var match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
        return match ? match[1] : null;
    }

    if (btnEmbedVideo && ytUrlInput && ytVideoPlayer) {
        btnEmbedVideo.addEventListener('click', function () {
            var url = ytUrlInput.value.trim();
            if (!url) {
                showToast('Please enter a YouTube video URL ⚠️');
                return;
            }
            var videoId = extractYouTubeId(url);
            if (videoId) {
                ytVideoPlayer.src = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?enablejsapi=1&rel=0&modestbranding=1';
                showToast('Lecture video embedded successfully! 🎥');
            } else {
                showToast('Invalid or unsupported YouTube URL ⚠️');
            }
        });

        ytUrlInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                btnEmbedVideo.click();
            }
        });
    }

    // --- Commit 5: Rich-Text Notes and Timestamp Links ---
    var editorCanvas = document.getElementById('editorCanvas');
    var btnAddTimestamp = document.getElementById('btnAddTimestamp');
    var btnAiNotes = document.getElementById('btnAiNotes');
    var videoTimeReadout = document.getElementById('videoTimeReadout');

    var currentLectureSeconds = 213;

    function formatTime(secs) {
        var m = Math.floor(secs / 60);
        var s = secs % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    if (btnAddTimestamp && editorCanvas) {
        btnAddTimestamp.addEventListener('click', function () {
            var timeStr = formatTime(currentLectureSeconds);
            var timestampSpan = document.createElement('span');
            timestampSpan.className = 'timestamp-link';
            timestampSpan.setAttribute('data-timestamp', currentLectureSeconds);
            timestampSpan.setAttribute('role', 'button');
            timestampSpan.title = 'Jump video to ' + timeStr;
            timestampSpan.textContent = '[' + timeStr + ']';

            editorCanvas.focus();
            var sel = window.getSelection();
            if (sel && sel.rangeCount > 0 && editorCanvas.contains(sel.anchorNode)) {
                var range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(timestampSpan);
                range.collapse(false);
            } else {
                editorCanvas.appendChild(timestampSpan);
            }
            showToast('Timestamp [' + timeStr + '] added to notes!');
        });
    }

    if (btnAiNotes && editorCanvas) {
        btnAiNotes.addEventListener('click', function () {
            var btnText = document.getElementById('aiNotesBtnText');
            if (btnText) btnText.textContent = 'Generating…';
            showToast('Synthesizing notes preview from lecture transcript…');

            setTimeout(function () {
                if (btnText) btnText.textContent = 'AI Notes';
                var summarySection = document.createElement('div');
                summarySection.className = 'toggle-topic toggle-topic-open';
                summarySection.innerHTML = 
                    '<div class="toggle-topic-header" contenteditable="false">' +
                        '<button type="button" class="toggle-topic-trigger" aria-label="Toggle topic">' +
                            '<span class="toggle-topic-caret"></span>' +
                        '</button>' +
                        '<input class="toggle-topic-title" type="text" value="AI Synthesis: Key Takeaways (' + formatTime(currentLectureSeconds) + ')">' +
                    '</div>' +
                    '<div class="toggle-topic-content">' +
                        '<p>✨ <strong>Automated Lecture Synthesis (Preview):</strong></p>' +
                        '<ul>' +
                            '<li>Deep representations learn hierarchical feature detectors automatically through gradient descent.</li>' +
                            '<li>Matrix operations leverage parallel SIMD and GPU tensors for high-throughput batching.</li>' +
                        '</ul>' +
                    '</div>';
                editorCanvas.prepend(summarySection);
                showToast('✨ AI Summary added to your notes!');
            }, 1000);
        });
    }

    document.addEventListener('click', function (e) {
        var link = e.target.closest('.timestamp-link');
        if (link) {
            var secs = parseInt(link.getAttribute('data-timestamp'), 10) || 0;
            currentLectureSeconds = secs;
            if (videoTimeReadout) {
                videoTimeReadout.textContent = formatTime(secs);
            }
            if (ytVideoPlayer && ytVideoPlayer.contentWindow) {
                try {
                    ytVideoPlayer.contentWindow.postMessage(JSON.stringify({
                        event: 'command',
                        func: 'seekTo',
                        args: [secs, true]
                    }), '*');
                } catch (err) {}
            }
            showToast('Seeking video to ' + formatTime(secs) + ' ⏩');
        }
    });

    function setupFormatCommand(btnId, command, value) {
        var btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (editorCanvas) {
                editorCanvas.focus();
                document.execCommand(command, false, value || null);
            }
        });
    }

    setupFormatCommand('cmdBold', 'bold');
    setupFormatCommand('cmdItalic', 'italic');
    setupFormatCommand('cmdUnderline', 'underline');
    setupFormatCommand('cmdStrike', 'strikeThrough');
    setupFormatCommand('cmdH1', 'formatBlock', 'H1');
    setupFormatCommand('cmdH2', 'formatBlock', 'H2');
    setupFormatCommand('cmdBullet', 'insertUnorderedList');
    setupFormatCommand('cmdOrdered', 'insertOrderedList');
    setupFormatCommand('cmdQuote', 'formatBlock', 'BLOCKQUOTE');
    setupFormatCommand('cmdHr', 'insertHorizontalRule');
    setupFormatCommand('cmdUndo', 'undo');
    setupFormatCommand('cmdRedo', 'redo');
    setupFormatCommand('cmdHighlight', 'hiliteColor', 'rgba(236, 50, 159, 0.85)');

    var workspaceSelectionBubble = document.getElementById('workspaceSelectionBubble');
    var bubbleBtnYes = document.getElementById('bubbleBtnYes');
    var bubbleBtnNo = document.getElementById('bubbleBtnNo');
    var pendingSelectionRange = null;

    function hideWorkspaceBubble() {
        if (workspaceSelectionBubble) {
            workspaceSelectionBubble.classList.remove('show');
            workspaceSelectionBubble.style.display = 'none';
        }
        pendingSelectionRange = null;
    }

    function showWorkspaceBubble(rect) {
        if (!workspaceSelectionBubble) return;
        var top = rect.top - 46;
        var left = rect.left + rect.width / 2;

        if (top < 10) top = rect.bottom + 10;
        if (left < 90) left = 90;
        if (left > window.innerWidth - 90) left = window.innerWidth - 90;

        workspaceSelectionBubble.style.top = top + 'px';
        workspaceSelectionBubble.style.left = left + 'px';
        workspaceSelectionBubble.style.display = 'flex';
        workspaceSelectionBubble.classList.add('show');
    }

    document.addEventListener('mouseup', function (e) {
        if (e.target && e.target.closest && e.target.closest('.workspace-selection-bubble')) {
            return;
        }

        setTimeout(function () {
            var sel = window.getSelection();
            if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
                hideWorkspaceBubble();
                return;
            }

            if (!editorCanvas || !editorCanvas.contains(sel.anchorNode)) {
                hideWorkspaceBubble();
                return;
            }

            var text = sel.toString().trim();
            if (text.length < 5 || text.split(/\s+/).length > 250) {
                hideWorkspaceBubble();
                return;
            }

            var range = sel.getRangeAt(0);
            pendingSelectionRange = range.cloneRange();
            var rect = range.getBoundingClientRect();
            showWorkspaceBubble(rect);
        }, 10);
    });

    if (bubbleBtnYes) {
        bubbleBtnYes.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (pendingSelectionRange) {
                try {
                    var mark = document.createElement('mark');
                    mark.className = 'notes-highlight-mark';
                    mark.title = 'AI Flashcard source';
                    mark.appendChild(pendingSelectionRange.extractContents());
                    pendingSelectionRange.insertNode(mark);
                } catch (err) {
                    document.execCommand('hiliteColor', false, 'rgba(236, 50, 159, 0.85)');
                }
            }

            hideWorkspaceBubble();
            showToast('✨ 3 AI Flashcards generated from note highlight!', 3500);
            cycleCardDeck();
        });
    }

    if (bubbleBtnNo) {
        bubbleBtnNo.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            hideWorkspaceBubble();
        });
    }

    window.addEventListener('scroll', hideWorkspaceBubble, { passive: true });
    window.addEventListener('resize', hideWorkspaceBubble, { passive: true });

    var cmdVoice = document.getElementById('cmdVoice');
    if (cmdVoice) {
        cmdVoice.addEventListener('click', function () {
            showToast('🎙️ Voice-to-text listening… (Dictation simulation)');
        });
    }

    var btnInsertCodeBlock = document.getElementById('btnInsertCodeBlock');
    if (btnInsertCodeBlock && editorCanvas) {
        btnInsertCodeBlock.addEventListener('click', function () {
            var pre = document.createElement('pre');
            pre.style.cssText = 'background:#0e0a15; color:#7ad1f5; border:2px solid var(--ink); border-radius:8px; padding:12px; margin:12px 0; font-family:var(--font-mono);';
            pre.textContent = 'function calculateActivation(z) {\n  return 1 / (1 + Math.exp(-z));\n}';
            editorCanvas.appendChild(pre);
            showToast('Code block inserted into notes 💻');
        });
    }

    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('.toggle-topic-trigger');
        if (trigger) {
            var topic = trigger.closest('.toggle-topic');
            if (topic) {
                topic.classList.toggle('closed');
            }
        }
    });

    var signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var submitBtn = signinForm.querySelector('.submit');
            if (submitBtn) {
                submitBtn.textContent = 'SIGNING IN...';
                setTimeout(function () {
                    submitBtn.textContent = '✓ SUCCESS';
                    setTimeout(function () {
                        window.location.href = 'index.html#features';
                    }, 500);
                }, 600);
            }
        });
    }
});

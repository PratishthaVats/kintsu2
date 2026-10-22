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
            if (selectionPopup) selectionPopup.classList.add('show');

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

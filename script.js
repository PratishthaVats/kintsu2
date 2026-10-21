var toggle = document.getElementById('darkToggle');

// Load saved theme
if (localStorage.getItem('kintsu_theme') === 'dark') {
    document.body.classList.add('dark');
    if (toggle) toggle.textContent = '☀️';
}

if (toggle) {
    toggle.addEventListener('click', function () {
        document.body.classList.toggle('dark');
        var isDark = document.body.classList.contains('dark');
        toggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('kintsu_theme', isDark ? 'dark' : 'light');
    });
}

// 3D Flashcard Flip Interaction
var demoCard = document.getElementById('demoCard');
if (demoCard) {
    demoCard.addEventListener('click', function () {
        demoCard.classList.toggle('flipped');
    });
    demoCard.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            demoCard.classList.toggle('flipped');
        }
    });
}

// Sign In Form Interaction
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

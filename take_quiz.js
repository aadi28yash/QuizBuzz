let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let timeLeft = 0;
let timerInterval;

// Initialize quiz
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAuthenticated || currentUser.role !== 'student') {
        showError('Please login as a student to take quizzes').then(() => {
            window.location.href = 'index.html';
        });
        return;
    }

    const quizId = localStorage.getItem('currentQuizId');
    if (!quizId) {
        alert('No quiz selected!');
        window.location.href = 'student_dashboard.html';
        return;
    }

    loadQuiz(quizId);
});

// Load quiz
function loadQuiz(quizId) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    currentQuiz = quizzes.find(q => q.id === quizId);

    if (!currentQuiz) {
        showError('Quiz not found!').then(() => {
            window.location.href = 'student_dashboard.html';
        });
        return;
    }

    // Initialize quiz state
    document.getElementById('quizTitle').textContent = currentQuiz.title || 'Untitled Quiz';
    userAnswers = new Array(currentQuiz.questions.length).fill(null);
    timeLeft = currentQuiz.duration;
    
    // Update question counter
    document.getElementById('questionCounter').textContent = 
        `Question 1 of ${currentQuiz.questions.length}`;
    
    // Start timer
    startTimer();
    
    // Load first question
    loadQuestion(0);
    
    // Add event listeners
    document.getElementById('prevBtn').addEventListener('click', previousQuestion);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('submitBtn').addEventListener('click', submitQuiz);
    
    // Add event listeners for options
    document.querySelectorAll('.option-btn').forEach(button => {
        button.addEventListener('click', () => selectOption(button.dataset.option));
    });

    console.log('Quiz loaded:', currentQuiz.title); // Debug log
}

// Load question
function loadQuestion(index) {
    const question = currentQuiz.questions[index];
    document.getElementById('questionCounter').textContent = 
        `Question ${index + 1} of ${currentQuiz.questions.length}`;
    document.getElementById('questionText').textContent = question.questionText;
    
    // Update options
    const options = ['A', 'B', 'C', 'D'];
    options.forEach(option => {
        const button = document.querySelector(`.option-btn[data-option="${option}"]`);
        button.querySelector('.option-text').textContent = question.options[option];
        button.classList.remove('selected');
        if (userAnswers[index] === option) {
            button.classList.add('selected');
        }
    });
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').style.display = 
        index === currentQuiz.questions.length - 1 ? 'none' : 'block';
    document.getElementById('submitBtn').style.display = 
        index === currentQuiz.questions.length - 1 ? 'block' : 'none';
}

// Select option
function selectOption(option) {
    userAnswers[currentQuestionIndex] = option;
    document.querySelectorAll('.option-btn').forEach(button => {
        button.classList.remove('selected');
        if (button.dataset.option === option) {
            button.classList.add('selected');
        }
    });
}

// Navigation functions
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    }
}

// Timer functions
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Submit quiz function
function submitQuiz() {
    try {
        clearInterval(timerInterval);
        
        // Calculate score
        let score = 0;
        currentQuiz.questions.forEach((question, index) => {
            if (userAnswers[index] === question.correctAnswer) {
                score++;
            }
        });

        // Save result
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const result = {
            quizId: currentQuiz.id,
            studentId: currentUser.id,
            studentName: currentUser.name,
            score: score,
            totalQuestions: currentQuiz.questions.length,
            completedAt: new Date().toISOString(),
            answers: userAnswers
        };
        
        // Save to localStorage
        const quizResults = JSON.parse(localStorage.getItem('quizResults')) || [];
        quizResults.push(result);
        localStorage.setItem('quizResults', JSON.stringify(quizResults));

        // Show completion message
        Swal.fire({
            icon: 'success',
            title: 'Quiz Completed!',
            html: `
                <div class="score-display">
                    <h3>Your Score: ${score}/${currentQuiz.questions.length}</h3>
                    <h4>${Math.round((score / currentQuiz.questions.length) * 100)}%</h4>
                </div>
            `,
            confirmButtonText: 'Back to Dashboard',
            allowOutsideClick: false
        }).then(() => {
            window.location.href = 'student_dashboard.html';
        });

    } catch (error) {
        console.error('Submit error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an error submitting your quiz. Please try again.'
        });
        // Restart timer if submission fails
        startTimer();
    }
}

// Function to save quiz result
function saveQuizResult(score) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const result = {
        quizId: currentQuiz.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        score: score,
        totalQuestions: currentQuiz.questions.length,
        completedAt: new Date().toISOString(),
        answers: userAnswers
    };
    
    const quizResults = JSON.parse(localStorage.getItem('quizResults')) || [];
    quizResults.push(result);
    localStorage.setItem('quizResults', JSON.stringify(quizResults));
    
    // Show result with SweetAlert2
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    Swal.fire({
        icon: 'success',
        title: 'Quiz Completed!',
        html: `
            <div class="score-display">
                <h3>Your Score: ${score}/${currentQuiz.questions.length}</h3>
                <h4>${percentage}%</h4>
            </div>
        `,
        confirmButtonText: 'Back to Dashboard',
        allowOutsideClick: false
    }).then(() => {
        window.location.href = 'student_dashboard.html';
    });
}

// Replace alert with showError
function showError(message) {
    return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message
    });
}

// Replace alert with showScore
function showScore(score, total) {
    const percentage = Math.round((score / total) * 100);
    return Swal.fire({
        icon: 'success',
        title: 'Quiz Completed!',
        html: `
            <h3>Your Score: ${score}/${total}</h3>
            <h4>${percentage}%</h4>
        `,
        confirmButtonText: 'Back to Dashboard'
    });
} 
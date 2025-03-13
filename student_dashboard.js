// Initialize dashboard
function initializeDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || !currentUser.isAuthenticated || currentUser.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('studentName').textContent = currentUser.name;
    loadQuizzes();
}

// Load quizzes
function loadQuizzes() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quizResults = JSON.parse(localStorage.getItem('quizResults')) || [];
    
    // Get completed quizzes for this student
    const studentResults = quizResults.filter(result => result.studentId === currentUser.id);
    const completedQuizIds = studentResults.map(result => result.quizId);
    
    // Filter available quizzes (not completed by this student)
    const availableQuizzes = allQuizzes.filter(quiz => !completedQuizIds.includes(quiz.id));
    
    // Update stats
    document.getElementById('completedQuizzes').textContent = completedQuizIds.length;
    document.getElementById('availableQuizzes').textContent = availableQuizzes.length;
    
    // Calculate average score properly
    const avgScore = studentResults.length > 0
        ? Math.round(studentResults.reduce((sum, result) => {
            return sum + ((result.score / result.totalQuestions) * 100);
        }, 0) / studentResults.length)
        : 0;
    document.getElementById('averageScore').textContent = avgScore + '%';
    
    // Display available quizzes
    displayAvailableQuizzes(availableQuizzes);
    displayCompletedQuizzes(allQuizzes, studentResults);
}

// Display available quizzes
function displayAvailableQuizzes(quizzes) {
    const quizList = document.getElementById('availableQuizList');
    quizList.innerHTML = '';
    
    if (quizzes.length === 0) {
        quizList.innerHTML = '<p class="no-quizzes">No quizzes available.</p>';
        return;
    }
    
    quizzes.forEach(quiz => {
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';
        
        quizCard.innerHTML = `
            <h3>${quiz.title}</h3>
            <div class="quiz-info">
                <p><i class="fas fa-question-circle"></i> Questions: ${quiz.questions.length}</p>
                <p><i class="fas fa-clock"></i> Duration: ${quiz.duration} seconds</p>
                <p><i class="fas fa-user-tie"></i> Teacher: ${quiz.teacherName}</p>
            </div>
            <button onclick="startQuiz('${quiz.id}')" class="start-btn">
                <i class="fas fa-play"></i> Start Quiz
            </button>
        `;
        
        quizList.appendChild(quizCard);
    });
}

// Display completed quizzes
function displayCompletedQuizzes(allQuizzes, results) {
    const quizList = document.getElementById('completedQuizList');
    quizList.innerHTML = '';
    
    if (results.length === 0) {
        quizList.innerHTML = '<p class="no-quizzes">No quizzes completed yet.</p>';
        return;
    }
    
    results.forEach(result => {
        const quiz = allQuizzes.find(q => q.id === result.quizId);
        if (!quiz) return;
        
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card completed';
        
        const score = Math.round((result.score / result.totalQuestions) * 100);
        
        quizCard.innerHTML = `
            <h3>${quiz.title}</h3>
            <div class="quiz-info">
                <p><i class="fas fa-trophy"></i> Score: ${result.score}/${result.totalQuestions} (${score}%)</p>
                <p><i class="fas fa-calendar"></i> Completed: ${new Date(result.completedAt).toLocaleDateString()}</p>
                <p><i class="fas fa-user-tie"></i> Teacher: ${quiz.teacherName}</p>
            </div>
            <button onclick="reviewQuiz('${quiz.id}')" class="review-btn">
                <i class="fas fa-eye"></i> Review Answers
            </button>
        `;
        
        quizList.appendChild(quizCard);
    });
}

// Start quiz function
function startQuiz(quizId) {
    // Store the quiz ID and redirect to quiz page
    localStorage.setItem('currentQuizId', quizId);
    window.location.href = 'take_quiz.html';
}

// Add review quiz function
function reviewQuiz(quizId) {
    localStorage.setItem('reviewQuizId', quizId);
    window.location.href = 'review_quiz.html';
}

// Update the logout function
function logout() {
    Swal.fire({
        title: 'Logout',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);

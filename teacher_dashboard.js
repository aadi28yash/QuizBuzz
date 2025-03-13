// Initialize dashboard
function initializeDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Initializing dashboard for:', currentUser);

    if (!currentUser || !currentUser.isAuthenticated || currentUser.role !== 'teacher') {
        console.log('Authentication failed in dashboard');
        window.location.href = 'index.html';
        return;
    }

    try {
        document.getElementById('teacherName').textContent = currentUser.name;
        loadQuizzes();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Load teacher's quizzes
function loadQuizzes() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    console.log('Current user:', currentUser);
    console.log('All quizzes:', quizzes);
    
    // Filter quizzes for current teacher
    const teacherQuizzes = quizzes.filter(quiz => quiz.createdBy === currentUser.username);
    console.log('Teacher quizzes:', teacherQuizzes);
    
    // Get quiz results
    const quizResults = JSON.parse(localStorage.getItem('quizResults')) || [];
    
    updateOverallStats(teacherQuizzes, quizResults);
    
    // Display quizzes in the quiz list
    const quizList = document.getElementById('quizList');
    quizList.innerHTML = '';
    
    if (teacherQuizzes.length === 0) {
        quizList.innerHTML = '<p class="no-quizzes">No quizzes created yet.</p>';
        return;
    }
    
    teacherQuizzes.forEach(quiz => {
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';
        
        // Get statistics for this quiz
        const quizAttempts = quizResults.filter(result => result.quizId === quiz.id);
        const avgScore = quizAttempts.length > 0 
            ? Math.round(quizAttempts.reduce((sum, result) => 
                sum + ((result.score / result.totalQuestions) * 100), 0) / quizAttempts.length)
            : 0;
        
        quizCard.innerHTML = `
            <h3>${quiz.title}</h3>
            <div class="quiz-info">
                <p><i class="fas fa-question-circle"></i> Questions: ${quiz.questions.length}</p>
                <p><i class="fas fa-clock"></i> Duration: ${quiz.duration} seconds</p>
                <p><i class="fas fa-users"></i> Attempts: ${quizAttempts.length}</p>
                <p><i class="fas fa-chart-line"></i> Avg Score: ${avgScore}%</p>
                <p><i class="fas fa-calendar-alt"></i> Created: ${new Date(quiz.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="quiz-actions">
                <button onclick="editQuiz('${quiz.id}')" class="action-btn edit-btn">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="viewAttempts('${quiz.id}')" class="action-btn view-btn">
                    <i class="fas fa-users"></i> View Attempts
                </button>
                <button onclick="resetQuiz('${quiz.id}')" class="action-btn reset-btn">
                    <i class="fas fa-redo"></i> Reset
                </button>
                <button onclick="deleteQuiz('${quiz.id}')" class="action-btn delete-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        quizList.appendChild(quizCard);
    });
}

// Update overall statistics
function updateOverallStats(teacherQuizzes, quizResults) {
    document.getElementById('totalQuizzes').textContent = teacherQuizzes.length;
    document.getElementById('totalStudents').textContent = 
        new Set(quizResults.map(result => result.studentId)).size;
    
    const avgScore = quizResults.length > 0
        ? Math.round(quizResults.reduce((sum, result) => 
            sum + ((result.score / result.totalQuestions) * 100), 0) / quizResults.length)
        : 0;
    document.getElementById('averageScore').textContent = avgScore + '%';
}

// View quiz details
function viewQuizDetails(quizId) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quiz = quizzes.find(q => q.id === quizId);
    const results = JSON.parse(localStorage.getItem('quizResults')) || [];
    const quizResults = results.filter(result => result.quizId === quizId);

    // Update quiz title
    document.getElementById('quizTitle').textContent = quiz.title;

    // Calculate statistics
    const attempts = quizResults.length;
    const scores = quizResults.map(result => (result.score / result.totalQuestions) * 100);
    const avgScore = attempts > 0 ? Math.round(scores.reduce((a, b) => a + b) / attempts) : 0;
    const highestScore = attempts > 0 ? Math.round(Math.max(...scores)) : 0;
    const lowestScore = attempts > 0 ? Math.round(Math.min(...scores)) : 0;

    // Update statistics display
    document.getElementById('detailAttempts').textContent = attempts;
    document.getElementById('detailAverage').textContent = avgScore + '%';
    document.getElementById('detailHighest').textContent = highestScore + '%';
    document.getElementById('detailLowest').textContent = lowestScore + '%';

    // Display student results
    const studentResults = document.getElementById('studentResults');
    studentResults.innerHTML = '';

    if (quizResults.length === 0) {
        studentResults.innerHTML = '<p>No attempts yet</p>';
    } else {
        // Sort by score (highest first) and date (newest first)
        quizResults.sort((a, b) => {
            const scoreA = (a.score / a.totalQuestions) * 100;
            const scoreB = (b.score / b.totalQuestions) * 100;
            if (scoreB !== scoreA) return scoreB - scoreA;
            return new Date(b.completedAt) - new Date(a.completedAt);
        });

        quizResults.forEach(result => {
            const percentage = Math.round((result.score / result.totalQuestions) * 100);
            const resultDiv = document.createElement('div');
            resultDiv.classList.add('student-result');
            resultDiv.innerHTML = `
                <p><strong>Student:</strong> ${result.studentName}</p>
                <p><strong>Score:</strong> ${result.score}/${result.totalQuestions} (${percentage}%)</p>
                <p><strong>Completed:</strong> ${new Date(result.completedAt).toLocaleString()}</p>
            `;
            studentResults.appendChild(resultDiv);
        });
    }

    // Show details section and hide quiz list
    document.getElementById('quizListSection').style.display = 'none';
    document.getElementById('quizDetailsSection').style.display = 'block';
}

// Show quiz list
function showQuizList() {
    document.getElementById('quizDetailsSection').style.display = 'none';
    document.getElementById('quizListSection').style.display = 'block';
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Delete quiz
function deleteQuiz(quizId) {
    Swal.fire({
        title: 'Delete Quiz',
        text: 'Are you sure you want to delete this quiz? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            try {
                // Get current quizzes
                let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
                
                // Remove the quiz
                quizzes = quizzes.filter(quiz => quiz.id !== quizId);
                
                // Remove associated results
                let results = JSON.parse(localStorage.getItem('quizResults')) || [];
                results = results.filter(result => result.quizId !== quizId);
                
                // Save updated data
                localStorage.setItem('quizzes', JSON.stringify(quizzes));
                localStorage.setItem('quizResults', JSON.stringify(results));
                
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Quiz has been deleted successfully.',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    // Refresh the quiz list
                    loadQuizzes();
                });
            } catch (error) {
                console.error('Error deleting quiz:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete quiz. Please try again.'
                });
            }
        }
    });
}

// Edit quiz
function editQuiz(quizId) {
    // Store the quiz ID to edit in localStorage
    localStorage.setItem('editQuizId', quizId);
    // Redirect to add_quiz.html
    window.location.href = 'add_quiz.html';
}

// Reset quiz
function resetQuiz(quizId) {
    showConfirm('Reset Quiz', 'Are you sure you want to reset all student attempts for this quiz?')
    .then((result) => {
        if (result.isConfirmed) {
            let results = JSON.parse(localStorage.getItem('quizResults')) || [];
            results = results.filter(result => result.quizId !== quizId);
            localStorage.setItem('quizResults', JSON.stringify(results));
            loadQuizzes();
            showSuccess('Quiz has been reset successfully');
        }
    });
}

// Show confirmation dialog
function showConfirmationDialog(title, message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content confirmation-dialog">
            <h2>${title}</h2>
            <p>${message}</p>
            <div class="dialog-buttons">
                <button onclick="closeModal()" class="cancel-btn">Cancel</button>
                <button id="confirmButton" class="confirm-btn">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener to confirm button
    document.getElementById('confirmButton').onclick = () => {
        onConfirm();
        closeModal();
    };
}

// Close modal function
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Add this function
function createNewQuiz() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Creating new quiz, current user:', currentUser);
    
    if (!currentUser || !currentUser.isAuthenticated || currentUser.role !== 'teacher') {
        showError('Please login as a teacher to create quizzes.').then(() => {
            window.location.href = 'login.html';
        });
        return;
    }
    
    window.location.href = 'add_quiz.html';
}

// View quiz results
function viewResults(quizId) {
    const quiz = quizzes.find(q => q.id === quizId);
    const results = JSON.parse(localStorage.getItem('quizResults')) || [];
    const quizResults = results.filter(r => r.quizId === quizId);

    // Create modal for results
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    let resultsHTML = `
        <div class="modal-content">
            <h2>${quiz.title} - Results</h2>
            <div class="results-summary">
                <p>Total Attempts: ${quizResults.length}</p>
                <p>Average Score: ${calculateAverageScore(quizResults)}%</p>
            </div>
            <div class="results-list">
                <h3>Student Attempts</h3>
    `;

    if (quizResults.length === 0) {
        resultsHTML += '<p>No attempts yet</p>';
    } else {
        resultsHTML += `
            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Score</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        quizResults.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .forEach(result => {
                const score = Math.round((result.score / result.totalQuestions) * 100);
                resultsHTML += `
                    <tr>
                        <td>${result.studentName}</td>
                        <td>${score}%</td>
                        <td>${new Date(result.completedAt).toLocaleString()}</td>
                    </tr>
                `;
            });

        resultsHTML += '</tbody></table>';
    }

    resultsHTML += `
            </div>
            <button onclick="closeModal()" class="close-btn">Close</button>
        </div>
    `;

    modal.innerHTML = resultsHTML;
    document.body.appendChild(modal);
}

// Reset quiz results
function resetQuiz(quizId) {
    if (confirm('Are you sure you want to reset all results for this quiz? This cannot be undone.')) {
        const results = JSON.parse(localStorage.getItem('quizResults')) || [];
        const updatedResults = results.filter(r => r.quizId !== quizId);
        localStorage.setItem('quizResults', JSON.stringify(updatedResults));
        loadQuizzes(); // Refresh the display
        alert('Quiz results have been reset.');
    }
}

// Helper function to calculate average score
function calculateAverageScore(results) {
    if (results.length === 0) return 0;
    const totalScore = results.reduce((sum, result) => {
        return sum + (result.score / result.totalQuestions * 100);
    }, 0);
    return Math.round(totalScore / results.length);
}

// Close modal
function closeModal() {
    document.querySelector('.modal').remove();
}

// View attempts function
function viewAttempts(quizId) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) {
        showError('Quiz not found');
        return;
    }

    const results = JSON.parse(localStorage.getItem('quizResults')) || [];
    const quizAttempts = results.filter(r => r.quizId === quizId);

    // Calculate average score for this quiz
    const avgScore = quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((sum, result) => 
            sum + ((result.score / result.totalQuestions) * 100), 0) / quizAttempts.length)
        : 0;

    // Create modal with proper score display
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    let modalContent = `
        <div class="modal-content">
            <h2>${quiz.title} - Student Attempts</h2>
            <div class="attempts-summary">
                <p><i class="fas fa-users"></i> Total Attempts: ${quizAttempts.length}</p>
                <p><i class="fas fa-chart-line"></i> Average Score: ${avgScore}%</p>
            </div>
    `;

    if (quizAttempts.length === 0) {
        modalContent += '<p class="no-attempts">No attempts yet</p>';
    } else {
        modalContent += `
            <div class="attempts-list">
                <table>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Score</th>
                            <th>Percentage</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Sort attempts by date (newest first)
        quizAttempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .forEach(attempt => {
                const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                modalContent += `
                    <tr>
                        <td>${attempt.studentName}</td>
                        <td>${attempt.score}/${attempt.totalQuestions}</td>
                        <td>${percentage}%</td>
                        <td>${new Date(attempt.completedAt).toLocaleString()}</td>
                    </tr>
                `;
            });

        modalContent += '</tbody></table>';
    }

    modalContent += `
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()" class="close-btn">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;

    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
}

// Helper function to calculate average score
function calculateAverageScore(attempts) {
    if (attempts.length === 0) return 0;
    const totalScore = attempts.reduce((sum, attempt) => {
        return sum + (attempt.score / attempt.totalQuestions * 100);
    }, 0);
    return Math.round(totalScore / attempts.length);
}

// Close modal function
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
} 
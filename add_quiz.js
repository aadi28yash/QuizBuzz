// Initialize quizzes array from localStorage
let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
let currentQuestions = [];
let editQuizId = null;

// Check session when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Remove this check as it's now handled in add_quiz.html
    // const currentSession = JSON.parse(localStorage.getItem('currentSession'));
    // if (!currentSession || currentSession.role !== 'teacher') {
    //     alert('Please login as a teacher to create quizzes.');
    //     window.location.href = 'index.html';
    //     return;
    // }

    // Check if we're editing an existing quiz
    editQuizId = localStorage.getItem('editQuizId');
    if (editQuizId) {
        loadExistingQuiz(editQuizId);
        // Clear the editQuizId from localStorage
        localStorage.removeItem('editQuizId');
    }

    // Add event listeners for real-time updates
    document.getElementById('quizTitle').addEventListener('input', updateSummary);
    document.getElementById('quizDuration').addEventListener('input', updateSummary);
    document.getElementById('timeUnit').addEventListener('change', updateSummary);
    document.getElementById('clearQuestion').addEventListener('click', clearQuestionForm);

    // Remove required attribute from question form fields since they're not needed for final submission
    document.getElementById('questionText').removeAttribute('required');
    document.getElementById('optionA').removeAttribute('required');
    document.getElementById('optionB').removeAttribute('required');
    document.getElementById('optionC').removeAttribute('required');
    document.getElementById('optionD').removeAttribute('required');
    document.getElementById('correctAnswer').removeAttribute('required');
});

// Load existing quiz for editing
function loadExistingQuiz(quizId) {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    // Set quiz title and duration
    document.getElementById('quizTitle').value = quiz.title;
    const minutes = Math.floor(quiz.duration / 60);
    const seconds = quiz.duration % 60;
    
    if (seconds === 0) {
        document.getElementById('quizDuration').value = minutes;
        document.getElementById('timeUnit').value = 'minutes';
    } else {
        document.getElementById('quizDuration').value = quiz.duration;
        document.getElementById('timeUnit').value = 'seconds';
    }

    // Load questions
    currentQuestions = quiz.questions;
    
    // Display questions
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    
    currentQuestions.forEach((question, index) => {
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
        questionItem.dataset.questionId = question.id;
        
        questionItem.innerHTML = `
            <div class="question-header">
                <span class="question-number">Question ${index + 1}</span>
                <div class="question-actions">
                    <button class="edit-btn" onclick="editQuestion(this)">Edit</button>
                    <button class="delete-btn" onclick="deleteQuestion(this)">Delete</button>
                </div>
            </div>
            <p><strong>Question:</strong> ${question.questionText}</p>
            <p><strong>Options:</strong></p>
            <ul>
                <li>A) ${question.options.A}</li>
                <li>B) ${question.options.B}</li>
                <li>C) ${question.options.C}</li>
                <li>D) ${question.options.D}</li>
            </ul>
            <p><strong>Correct Answer:</strong> ${question.correctAnswer}</p>
        `;
        
        questionsContainer.appendChild(questionItem);
    });
    
    updateQuestionCount();
    updateSummary();
}

// Function to update quiz summary
function updateSummary() {
    const title = document.getElementById('quizTitle').value.trim() || 'Not set';
    const duration = document.getElementById('quizDuration').value;
    const timeUnit = document.getElementById('timeUnit').value;
    
    document.getElementById('summaryTitle').textContent = `Title: ${title}`;
    document.getElementById('summaryDuration').textContent = 
        duration ? `Duration: ${duration} ${timeUnit}` : 'Duration: Not set';
    document.getElementById('summaryQuestions').textContent = 
        `Questions: ${currentQuestions.length}`;
}

// Function to generate unique quiz ID
function generateQuizId() {
    return 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Function to validate question inputs
function validateQuestionInputs() {
    const questionText = document.getElementById('questionText').value.trim();
    const optionA = document.getElementById('optionA').value.trim();
    const optionB = document.getElementById('optionB').value.trim();
    const optionC = document.getElementById('optionC').value.trim();
    const optionD = document.getElementById('optionD').value.trim();
    const correctAnswer = document.getElementById('correctAnswer').value;

    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
        alert("Please fill in all fields for the question!");
        return null;
    }

    return {
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer
    };
}

// Function to handle adding a question
function addQuestion() {
    const inputs = validateQuestionInputs();
    if (!inputs) return;

    // Create question object
    const question = {
        id: Date.now(),
        questionText: inputs.questionText,
        options: {
            A: inputs.optionA,
            B: inputs.optionB,
            C: inputs.optionC,
            D: inputs.optionD
        },
        correctAnswer: inputs.correctAnswer
    };
    
    // Add to current questions array
    currentQuestions.push(question);

    // Add the question to the list
    const questionsContainer = document.getElementById('questionsContainer');
    const questionItem = document.createElement('div');
    questionItem.classList.add('question-item');
    questionItem.dataset.questionId = question.id;
    
    questionItem.innerHTML = `
        <div class="question-header">
            <span class="question-number">Question ${currentQuestions.length}</span>
            <div class="question-actions">
                <button class="edit-btn" onclick="editQuestion(this)">Edit</button>
                <button class="delete-btn" onclick="deleteQuestion(this)">Delete</button>
            </div>
        </div>
        <p><strong>Question:</strong> ${question.questionText}</p>
        <p><strong>Options:</strong></p>
        <ul>
            <li>A) ${question.options.A}</li>
            <li>B) ${question.options.B}</li>
            <li>C) ${question.options.C}</li>
            <li>D) ${question.options.D}</li>
        </ul>
        <p><strong>Correct Answer:</strong> ${question.correctAnswer}</p>
    `;
    
    questionsContainer.appendChild(questionItem);
    clearQuestionForm();
    updateQuestionCount();
    updateSummary();
}

// Function to update question count
function updateQuestionCount() {
    const count = currentQuestions.length;
    document.querySelector('.question-count').textContent = `Total Questions: ${count}`;
    
    // Update question numbers
    document.querySelectorAll('.question-number').forEach((span, index) => {
        span.textContent = `Question ${index + 1}`;
    });
}

// Function to clear question form
function clearQuestionForm() {
    document.getElementById('questionText').value = '';
    document.getElementById('optionA').value = '';
    document.getElementById('optionB').value = '';
    document.getElementById('optionC').value = '';
    document.getElementById('optionD').value = '';
    document.getElementById('correctAnswer').value = '';
    
    // Focus on question text area
    document.getElementById('questionText').focus();
}

// Function to delete a question
function deleteQuestion(button) {
    if (confirm('Are you sure you want to delete this question?')) {
        const questionItem = button.closest('.question-item');
        const questionId = parseInt(questionItem.dataset.questionId);
        currentQuestions = currentQuestions.filter(q => q.id !== questionId);
        questionItem.remove();
        updateQuestionCount();
        updateSummary();
    }
}

// Function to edit a question
function editQuestion(button) {
    const questionItem = button.closest('.question-item');
    const questionId = parseInt(questionItem.dataset.questionId);
    const question = currentQuestions.find(q => q.id === questionId);
    
    if (!question) return;

    document.getElementById('questionText').value = question.questionText;
    document.getElementById('optionA').value = question.options.A;
    document.getElementById('optionB').value = question.options.B;
    document.getElementById('optionC').value = question.options.C;
    document.getElementById('optionD').value = question.options.D;
    document.getElementById('correctAnswer').value = question.correctAnswer;

    // Remove the question from the array and list
    currentQuestions = currentQuestions.filter(q => q.id !== questionId);
    questionItem.remove();
    updateQuestionCount();
    updateSummary();
    
    // Scroll to the question form
    document.querySelector('.question-form').scrollIntoView({ behavior: 'smooth' });
}

// Add event listener for the Add Next Question button
document.getElementById('addNextQuestion').addEventListener('click', addQuestion);

// Function to validate quiz settings
function validateQuizSettings() {
    const quizTitle = document.getElementById('quizTitle').value.trim();
    const duration = document.getElementById('quizDuration').value;
    
    if (!quizTitle) {
        alert('Please enter a quiz title!');
        document.getElementById('quizTitle').focus();
        return null;
    }

    if (!duration || duration <= 0) {
        alert('Please set a valid quiz duration!');
        document.getElementById('quizDuration').focus();
        return null;
    }

    const timeUnit = document.getElementById('timeUnit').value;
    return {
        title: quizTitle,
        duration: timeUnit === 'minutes' ? duration * 60 : parseInt(duration)
    };
}

// Function to handle quiz submission
document.getElementById('quizForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Check authentication using currentUser instead of currentSession
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAuthenticated || currentUser.role !== 'teacher') {
        alert('Your session has expired. Please login again.');
        window.location.href = 'index.html';
        return;
    }

    // Check if questions exist first
    if (currentQuestions.length === 0) {
        alert('Please add at least one question to the quiz!');
        document.querySelector('.question-form').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // Validate quiz settings
    const quizSettings = validateQuizSettings();
    if (!quizSettings) return;

    try {
        if (editQuizId) {
            // Update existing quiz
            const quizIndex = quizzes.findIndex(q => q.id === editQuizId);
            if (quizIndex !== -1) {
                quizzes[quizIndex] = {
                    ...quizzes[quizIndex],
                    title: quizSettings.title,
                    questions: currentQuestions,
                    duration: quizSettings.duration,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new quiz using currentUser instead of currentSession
            const quiz = {
                id: generateQuizId(),
                title: quizSettings.title,
                questions: currentQuestions,
                duration: quizSettings.duration,
                createdBy: currentUser.username,
                teacherName: currentUser.name,
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            quizzes.push(quiz);
        }

        // Save to localStorage
        localStorage.setItem('quizzes', JSON.stringify(quizzes));

        alert(editQuizId ? 'Quiz updated successfully!' : 'Quiz created successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = 'teacher_dashboard.html';
        }, 500);

    } catch (error) {
        console.error('Quiz operation error:', error);
        alert('There was an error. Please try again.');
    }
});

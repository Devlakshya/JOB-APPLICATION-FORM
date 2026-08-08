document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // DOM Elements Selection
  // ==========================================================================
  const form = document.getElementById('job-application-form');
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  // Inputs
  const fullNameInput = document.getElementById('fullname');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  const linkedinInput = document.getElementById('linkedin');
  const portfolioInput = document.getElementById('portfolio');
  const experienceInput = document.getElementById('experience');
  const coverLetterInput = document.getElementById('coverletter');
  const resumeInput = document.getElementById('resume');
  const termsCheckbox = document.getElementById('terms');
  
  // Custom Controls & Displays
  const togglePwVisibilityBtn = document.getElementById('toggle-pw-visibility');
  const eyeOpenIcon = togglePwVisibilityBtn.querySelector('.eye-open');
  const eyeClosedIcon = togglePwVisibilityBtn.querySelector('.eye-closed');
  
  const strengthContainer = document.querySelector('.pw-strength-container');
  const strengthText = document.getElementById('strength-text');
  
  const charCounter = document.getElementById('char-counter');
  
  const dropzone = document.getElementById('dropzone');
  const dropzonePrompt = document.getElementById('dropzone-prompt');
  const dropzoneSelected = document.getElementById('dropzone-selected');
  const fileNameDisplay = document.getElementById('file-name');
  const fileSizeDisplay = document.getElementById('file-size');
  const removeFileBtn = document.getElementById('remove-file-btn');
  
  // Success Modal
  const successModal = document.getElementById('success-modal');
  const successUserName = document.getElementById('success-user-name');
  const successUserEmail = document.getElementById('success-user-email');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const viewDashboardBtn = document.getElementById('view-dashboard-btn');
  
  // Dashboard Elements
  const applicationsTable = document.getElementById('applications-table');
  const applicationsList = document.getElementById('applications-list');
  const emptyTableRow = document.getElementById('empty-table-row');
  const clearStorageBtn = document.getElementById('clear-storage-btn');

  // Track if user has interacted with a field to avoid aggressive early validation
  const touchedFields = {
    fullname: false,
    email: false,
    phone: false,
    password: false,
    linkedin: false,
    portfolio: false,
    experience: false,
    resume: false,
    terms: false
  };

  // State to store uploaded file details
  let uploadedFile = null;

  // ==========================================================================
  // Theme Toggle Logic
  // ==========================================================================
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // ==========================================================================
  // UI Helper Functions
  // ==========================================================================
  
  // Mark form group as valid
  function setValid(inputEl, groupEl, errorEl) {
    groupEl.classList.remove('invalid');
    groupEl.classList.add('valid');
    if (errorEl) {
      errorEl.textContent = '';
    }
  }

  // Mark form group as invalid
  function setInvalid(inputEl, groupEl, errorEl, message) {
    groupEl.classList.remove('valid');
    groupEl.classList.add('invalid');
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  // Clear validation classes
  function clearValidationState(groupEl, errorEl) {
    groupEl.classList.remove('valid', 'invalid');
    if (errorEl) {
      errorEl.textContent = '';
    }
  }

  // Trigger shake animation on group
  function shakeGroup(groupEl) {
    groupEl.classList.remove('shake');
    // Trigger reflow to restart animation
    void groupEl.offsetWidth;
    groupEl.classList.add('shake');
    // Remove class after animation finishes (350ms)
    setTimeout(() => {
      groupEl.classList.remove('shake');
    }, 350);
  }

  // ==========================================================================
  // Field Validation Logic
  // ==========================================================================

  // 1. Full Name Validation
  function validateFullName(isSubmitting = false) {
    const group = document.getElementById('group-fullname');
    const error = document.getElementById('error-fullname');
    const value = fullNameInput.value.trim();

    if (!isSubmitting && !touchedFields.fullname) return true;

    if (value === '') {
      setInvalid(fullNameInput, group, error, 'Full name is required.');
      return false;
    }
    if (value.length < 3) {
      setInvalid(fullNameInput, group, error, 'Name must be at least 3 characters.');
      return false;
    }
    // Only alphabets and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(value)) {
      setInvalid(fullNameInput, group, error, 'Only alphabets and spaces are allowed.');
      return false;
    }

    setValid(fullNameInput, group, error);
    return true;
  }

  // 2. Email Validation
  function validateEmail(isSubmitting = false) {
    const group = document.getElementById('group-email');
    const error = document.getElementById('error-email');
    const value = emailInput.value.trim();

    if (!isSubmitting && !touchedFields.email) return true;

    if (value === '') {
      setInvalid(emailInput, group, error, 'Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setInvalid(emailInput, group, error, 'Please enter a valid email address.');
      return false;
    }

    setValid(emailInput, group, error);
    return true;
  }

  // 3. Phone Number Validation
  function validatePhone(isSubmitting = false) {
    const group = document.getElementById('group-phone');
    const error = document.getElementById('error-phone');
    const value = phoneInput.value.trim();

    if (!isSubmitting && !touchedFields.phone) return true;

    if (value === '') {
      setInvalid(phoneInput, group, error, 'Phone number is required.');
      return false;
    }
    // Only numeric, exactly 10 digits
    const digitsOnlyRegex = /^\d+$/;
    if (!digitsOnlyRegex.test(value)) {
      setInvalid(phoneInput, group, error, 'Only numeric values are allowed.');
      return false;
    }
    if (value.length !== 10) {
      setInvalid(phoneInput, group, error, 'Phone number must contain exactly 10 digits.');
      return false;
    }

    setValid(phoneInput, group, error);
    return true;
  }

  // 4. Password Validation & Strength Meter
  function getPasswordStrengthScore(password) {
    let score = 0;
    if (password.length === 0) return 0;
    
    // Criteria
    if (password.length >= 8) score++; // length
    if (/[a-z]/.test(password)) score++; // lowercase
    if (/[A-Z]/.test(password)) score++; // uppercase
    if (/\d/.test(password)) score++;    // numbers
    if (/[^A-Za-z0-9]/.test(password)) score++; // special chars
    
    return score;
  }

  function updatePasswordStrengthMeter(password) {
    const score = getPasswordStrengthScore(password);
    
    // Clear existing classes
    strengthContainer.className = 'pw-strength-container';
    
    if (password.length === 0) {
      strengthText.textContent = 'Empty';
      return;
    }

    if (score <= 2) {
      strengthContainer.classList.add('strength-lv1'); // Weak
      strengthText.textContent = 'Weak';
    } else if (score === 3) {
      strengthContainer.classList.add('strength-lv2'); // Fair
      strengthText.textContent = 'Fair';
    } else if (score === 4) {
      strengthContainer.classList.add('strength-lv3'); // Good
      strengthText.textContent = 'Good';
    } else {
      strengthContainer.classList.add('strength-lv4'); // Strong
      strengthText.textContent = 'Strong';
    }
  }

  function validatePassword(isSubmitting = false) {
    const group = document.getElementById('group-password');
    const error = document.getElementById('error-password');
    const value = passwordInput.value;

    if (!isSubmitting && !touchedFields.password) {
      // Update meter anyway as user types
      updatePasswordStrengthMeter(value);
      return true;
    }

    updatePasswordStrengthMeter(value);

    if (value === '') {
      setInvalid(passwordInput, group, error, 'Password is required.');
      return false;
    }
    if (value.length < 8) {
      setInvalid(passwordInput, group, error, 'Password must be at least 8 characters long.');
      return false;
    }
    
    const strengthScore = getPasswordStrengthScore(value);
    if (strengthScore < 3) {
      setInvalid(passwordInput, group, error, 'Password is too weak. Must meet at least "Good" strength criteria.');
      return false;
    }

    setValid(passwordInput, group, error);
    return true;
  }

  // Toggle Password Visibility
  togglePwVisibilityBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    eyeOpenIcon.classList.toggle('hidden');
    eyeClosedIcon.classList.toggle('hidden');
  });

  // 5. LinkedIn Profile URL Validation
  function validateLinkedIn(isSubmitting = false) {
    const group = document.getElementById('group-linkedin');
    const error = document.getElementById('error-linkedin');
    const value = linkedinInput.value.trim();

    if (!isSubmitting && !touchedFields.linkedin) return true;

    if (value === '') {
      setInvalid(linkedinInput, group, error, 'LinkedIn Profile URL is required.');
      return false;
    }
    
    // LinkedIn profile URL regex
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/;
    if (!linkedinRegex.test(value)) {
      setInvalid(linkedinInput, group, error, 'Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username).');
      return false;
    }

    setValid(linkedinInput, group, error);
    return true;
  }

  // 6. Portfolio URL Validation
  function validatePortfolio(isSubmitting = false) {
    const group = document.getElementById('group-portfolio');
    const error = document.getElementById('error-portfolio');
    const value = portfolioInput.value.trim();

    if (!isSubmitting && !touchedFields.portfolio) return true;

    if (value === '') {
      setInvalid(portfolioInput, group, error, 'Portfolio URL is required.');
      return false;
    }

    // URL validation using URL API
    let isValid = false;
    try {
      const url = new URL(value);
      isValid = (url.protocol === 'http:' || url.protocol === 'https:');
    } catch (_) {
      isValid = false;
    }

    if (!isValid) {
      setInvalid(portfolioInput, group, error, 'Please enter a valid website URL (including http:// or https://).');
      return false;
    }

    setValid(portfolioInput, group, error);
    return true;
  }

  // 7. Years of Experience Validation
  function validateExperience(isSubmitting = false) {
    const group = document.getElementById('group-experience');
    const error = document.getElementById('error-experience');
    const value = experienceInput.value.trim();

    if (!isSubmitting && !touchedFields.experience) return true;

    if (value === '') {
      setInvalid(experienceInput, group, error, 'Years of experience is required.');
      return false;
    }

    const expNum = Number(value);
    if (isNaN(expNum) || expNum < 0 || expNum > 30) {
      setInvalid(experienceInput, group, error, 'Experience must be a number between 0 and 30.');
      return false;
    }

    setValid(experienceInput, group, error);
    return true;
  }

  // 8. Cover Letter Character Counter
  coverLetterInput.addEventListener('input', () => {
    const currentLength = coverLetterInput.value.length;
    charCounter.textContent = `${currentLength} / 500 characters`;
    
    charCounter.classList.remove('counter-warning', 'counter-danger');
    if (currentLength >= 480) {
      charCounter.classList.add('counter-danger');
    } else if (currentLength >= 400) {
      charCounter.classList.add('counter-warning');
    }
  });

  // 9. Resume File Validation
  function validateResume(isSubmitting = false) {
    const group = document.getElementById('group-resume');
    const error = document.getElementById('error-resume');

    if (!isSubmitting && !touchedFields.resume) return true;

    if (!uploadedFile) {
      setInvalid(resumeInput, group, error, 'Please upload your resume.');
      return false;
    }

    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.endsWith('.pdf')) {
      setInvalid(resumeInput, group, error, 'Only PDF files are allowed.');
      return false;
    }

    const maxSizeBytes = 2 * 1024 * 1024; // 2MB
    if (uploadedFile.size > maxSizeBytes) {
      setInvalid(resumeInput, group, error, 'File size must not exceed 2 MB.');
      return false;
    }

    setValid(resumeInput, group, error);
    return true;
  }

  // Drag and Drop Logic
  function handleFileSelection(file) {
    if (!file) return;
    
    uploadedFile = file;
    touchedFields.resume = true;

    // Run resume validation
    const isValid = validateResume(true);
    
    if (isValid) {
      // Update UI to selected state
      fileNameDisplay.textContent = file.name;
      // Convert size to readable MB or KB
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;
      fileSizeDisplay.textContent = sizeStr;

      dropzonePrompt.classList.add('hidden');
      dropzoneSelected.classList.remove('hidden');
    } else {
      // Reset state if validation failed
      clearSelectedFile();
    }
  }

  function clearSelectedFile() {
    uploadedFile = null;
    resumeInput.value = ''; // Clear file input
    dropzoneSelected.classList.add('hidden');
    dropzonePrompt.classList.remove('hidden');
  }

  // Trigger file click when clicking dropzone
  dropzone.addEventListener('click', (e) => {
    // Avoid click bubbling if clicking remove button
    if (e.target.closest('#remove-file-btn') || e.target.closest('input')) return;
    resumeInput.click();
  });

  resumeInput.addEventListener('change', () => {
    if (resumeInput.files.length > 0) {
      handleFileSelection(resumeInput.files[0]);
    }
  });

  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearSelectedFile();
    // Validate again to show "resume required" error
    validateResume(true);
  });

  // Drag and drop event styling
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  });

  // 10. Terms & Conditions Validation
  function validateTerms(isSubmitting = false) {
    const group = document.getElementById('group-terms');
    const error = document.getElementById('error-terms');

    if (!isSubmitting && !touchedFields.terms) return true;

    if (!termsCheckbox.checked) {
      setInvalid(termsCheckbox, group, error, 'You must accept the terms & conditions.');
      return false;
    }

    setValid(termsCheckbox, group, error);
    return true;
  }

  // ==========================================================================
  // Real-Time Interaction Event Listeners
  // ==========================================================================

  const inputsWithValidation = [
    { el: fullNameInput, field: 'fullname', validator: validateFullName },
    { el: emailInput, field: 'email', validator: validateEmail },
    { el: phoneInput, field: 'phone', validator: validatePhone },
    { el: passwordInput, field: 'password', validator: validatePassword },
    { el: linkedinInput, field: 'linkedin', validator: validateLinkedIn },
    { el: portfolioInput, field: 'portfolio', validator: validatePortfolio },
    { el: experienceInput, field: 'experience', validator: validateExperience }
  ];

  // Set touched and run validation on input / blur
  inputsWithValidation.forEach(({ el, field, validator }) => {
    el.addEventListener('input', () => {
      touchedFields[field] = true;
      validator(false);
    });

    el.addEventListener('blur', () => {
      touchedFields[field] = true;
      validator(false);
    });
  });

  termsCheckbox.addEventListener('change', () => {
    touchedFields.terms = true;
    validateTerms(false);
  });

  // ==========================================================================
  // Submit & Save Form Logic
  // ==========================================================================

  // Dashboard Loader/Renderer
  function getStoredApplications() {
    const stored = localStorage.getItem('job_applications');
    return stored ? JSON.parse(stored) : [];
  }

  function saveApplication(appData) {
    const apps = getStoredApplications();
    apps.unshift(appData); // Add new application to the top
    localStorage.setItem('job_applications', JSON.stringify(apps));
    renderApplicationsTable();
  }

  function renderApplicationsTable() {
    const apps = getStoredApplications();
    
    // Clear list
    applicationsList.innerHTML = '';
    
    if (apps.length === 0) {
      applicationsList.appendChild(emptyTableRow);
      return;
    }

    apps.forEach(app => {
      const tr = document.createElement('tr');
      
      // Name
      const tdName = document.createElement('td');
      tdName.textContent = app.name;
      tdName.title = app.name;
      tr.appendChild(tdName);
      
      // Email
      const tdEmail = document.createElement('td');
      tdEmail.textContent = app.email;
      tdEmail.title = app.email;
      tr.appendChild(tdEmail);
      
      // Phone
      const tdPhone = document.createElement('td');
      tdPhone.textContent = app.phone;
      tr.appendChild(tdPhone);
      
      // Experience
      const tdExp = document.createElement('td');
      tdExp.textContent = `${app.experience} year${app.experience !== '1' ? 's' : ''}`;
      tr.appendChild(tdExp);
      
      // URLs
      const tdUrls = document.createElement('td');
      
      const liLink = document.createElement('a');
      liLink.href = app.linkedin;
      liLink.target = '_blank';
      liLink.className = 'table-link';
      liLink.textContent = 'LinkedIn';
      
      const space = document.createTextNode(' | ');
      
      const portLink = document.createElement('a');
      portLink.href = app.portfolio;
      portLink.target = '_blank';
      portLink.className = 'table-link';
      portLink.textContent = 'Portfolio';
      
      tdUrls.appendChild(liLink);
      tdUrls.appendChild(space);
      tdUrls.appendChild(portLink);
      tr.appendChild(tdUrls);
      
      // Resume
      const tdResume = document.createElement('td');
      tdResume.textContent = `${app.resumeName} (${app.resumeSize})`;
      tdResume.title = app.resumeName;
      tr.appendChild(tdResume);
      
      // Date Applied
      const tdDate = document.createElement('td');
      tdDate.textContent = new Date(app.dateApplied).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      tr.appendChild(tdDate);
      
      applicationsList.appendChild(tr);
    });
  }

  // Clear Storage Action
  clearStorageBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all submitted applications from Local Storage?')) {
      localStorage.removeItem('job_applications');
      renderApplicationsTable();
    }
  });

  // Load and render table on initial load
  renderApplicationsTable();

  // Reset form helper
  function resetForm() {
    form.reset();
    clearSelectedFile();
    
    // Reset Cover Letter counter
    charCounter.textContent = '0 / 500 characters';
    charCounter.className = 'counter-label';
    
    // Clear Password Strength
    updatePasswordStrengthMeter('');
    
    // Reset all touched state
    Object.keys(touchedFields).forEach(key => touchedFields[key] = false);
    
    // Reset all error displays and valid/invalid status classes
    const groups = form.querySelectorAll('.form-group');
    groups.forEach(group => {
      group.classList.remove('valid', 'invalid');
      const errorMsg = group.querySelector('.error-msg');
      if (errorMsg) errorMsg.textContent = '';
    });
  }

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Mark all fields as touched to trigger validation state displays
    Object.keys(touchedFields).forEach(key => touchedFields[key] = true);

    // Run validations
    const isNameValid = validateFullName(true);
    const isEmailValid = validateEmail(true);
    const isPhoneValid = validatePhone(true);
    const isPwValid = validatePassword(true);
    const isLinkedinValid = validateLinkedIn(true);
    const isPortfolioValid = validatePortfolio(true);
    const isExpValid = validateExperience(true);
    const isResumeValid = validateResume(true);
    const isTermsValid = validateTerms(true);

    const isFormValid = isNameValid && isEmailValid && isPhoneValid && isPwValid && 
                        isLinkedinValid && isPortfolioValid && isExpValid && 
                        isResumeValid && isTermsValid;

    if (!isFormValid) {
      // Find all invalid elements and shake them
      const invalidGroups = form.querySelectorAll('.form-group.invalid');
      invalidGroups.forEach(group => shakeGroup(group));

      // Focus the first invalid input element
      const firstInvalidGroup = invalidGroups[0];
      if (firstInvalidGroup) {
        const input = firstInvalidGroup.querySelector('input, textarea');
        if (input) {
          input.focus();
        }
      }
      return;
    }

    // Process Valid Form Submission
    const sizeStr = uploadedFile.size > 1024 * 1024 
      ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(uploadedFile.size / 1024).toFixed(1)} KB`;

    const newApplication = {
      name: fullNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      experience: experienceInput.value.trim(),
      linkedin: linkedinInput.value.trim(),
      portfolio: portfolioInput.value.trim(),
      coverLetter: coverLetterInput.value.trim(),
      resumeName: uploadedFile.name,
      resumeSize: sizeStr,
      dateApplied: new Date().toISOString()
    };

    // Save to Local Storage & update dashboard
    saveApplication(newApplication);

    // Show Success Modal with details
    successUserName.textContent = newApplication.name;
    successUserEmail.textContent = newApplication.email;
    successModal.classList.remove('hidden');
  });

  // Modal Closures
  closeModalBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
    resetForm();
    
  });

  viewDashboardBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
    resetForm();
    // Scroll to dashboard
    const dashboardSection = document.getElementById('dashboard-section');
    dashboardSection.scrollIntoView({ behavior: 'smooth' });
  });

});

document.addEventListener('DOMContentLoaded', () => {
    const windows = {
        fileExplorer: document.getElementById('fileExplorerWindow'),
        notepad: document.getElementById('notepadWindow'),
        calculator: document.getElementById('calculatorWindow'),
        terminal: document.getElementById('terminalWindow'),
        settings: document.getElementById('settingsWindow'),
        musicPlayer: document.getElementById('musicPlayerWindow'),
        webBrowser: document.getElementById('webBrowserWindow'),
        imageViewer: document.getElementById('imageViewerWindow'),
    };

    const startButton = document.getElementById('start-button');
    const menuContent = document.getElementById('menu-content');

    // Function to toggle window visibility
    function toggleWindow(win) {
        win.style.display = win.style.display === 'block' ? 'none' : 'block';
    }

    // Function to make windows draggable
    function makeWindowDraggable(windowElement) {
        const titleBar = windowElement.querySelector('.title-bar');
        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        titleBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - windowElement.getBoundingClientRect().left;
            offsetY = e.clientY - windowElement.getBoundingClientRect().top;
            windowElement.style.position = 'absolute';
            windowElement.style.zIndex = '1000';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                windowElement.style.left = `${e.clientX - offsetX}px`;
                windowElement.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // Apply draggable functionality to all windows
    Object.values(windows).forEach(makeWindowDraggable);

    // Event listeners for the taskbar and desktop icons
    document.getElementById('fileExplorerIcon').addEventListener('click', () => {
        toggleWindow(windows.fileExplorer);
    });

    document.getElementById('notepadIcon').addEventListener('click', () => {
        toggleWindow(windows.notepad);
    });

    document.getElementById('calculatorIcon').addEventListener('click', () => {
        toggleWindow(windows.calculator);
    });

    document.getElementById('terminalIcon').addEventListener('click', () => {
        toggleWindow(windows.terminal);
    });

    document.getElementById('webBrowserIcon').addEventListener('click', () => {
        toggleWindow(windows.webBrowser);
    });

    document.getElementById('imageViewerIcon').addEventListener('click', () => {
        toggleWindow(windows.imageViewer);
    });

    // Ensure the music and settings buttons work
    document.getElementById('music-button').addEventListener('click', () => {
        toggleWindow(windows.musicPlayer);
    });

    document.getElementById('settings-button').addEventListener('click', () => {
        toggleWindow(windows.settings);
    });

    startButton.addEventListener('click', () => {
        menuContent.classList.toggle('hidden');
    });

    // Close button functionality for all windows
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.window').style.display = 'none';
        });
    });

    // Web Browser functionality
    const browserUrl = document.getElementById('browserUrl');
    const goButton = document.getElementById('goButton');
    const browserIframe = document.getElementById('browserIframe');

    goButton.addEventListener('click', () => {
        const url = browserUrl.value.startsWith('http') ? browserUrl.value : `http://${browserUrl.value}`;
        browserIframe.src = url;
    });

    // Image Viewer functionality
    const imageToView = document.getElementById('imageToView');
    const imageUploader = document.getElementById('imageUploader');

    imageUploader.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageToView.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Calculator logic
    const calcDisplay = document.getElementById('calcDisplay');
    document.querySelectorAll('#calculatorButtons button').forEach(button => {
        button.addEventListener('click', () => {
            if (button.textContent === 'C') {
                calcDisplay.value = '';
            } else if (button.textContent === '=') {
                calcDisplay.value = eval(calcDisplay.value);
            } else {
                calcDisplay.value += button.textContent;
            }
        });
    });

    // Terminal logic
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.getElementById('terminalOutput');

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim();
            if (command) {
                terminalOutput.textContent += `> ${command}\n`;
                executeCommand(command);
                terminalInput.value = '';
            }
        }
    });

    function executeCommand(command) {
        if (command === 'help') {
            terminalOutput.textContent += 'Available commands: help, echo [message]\n';
        } else if (command.startsWith('echo ')) {
            terminalOutput.textContent += command.substring(5) + '\n';
        } else {
            terminalOutput.textContent += 'Command not recognized.\n';
        }
    }

    // Settings theme functionality
    const lightThemeButton = document.getElementById('lightThemeButton');
    const darkThemeButton = document.getElementById('darkThemeButton');

    lightThemeButton.addEventListener('click', () => {
        document.body.style.backgroundColor = '#87CEEB'; // Light theme
        document.getElementById('taskbar').style.backgroundColor = '#333';
    });

    darkThemeButton.addEventListener('click', () => {
        document.body.style.backgroundColor = '#333'; // Dark theme
        document.getElementById('taskbar').style.backgroundColor = '#000';
    });
});

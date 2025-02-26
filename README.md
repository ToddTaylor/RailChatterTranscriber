# Voice to Text Web Application

This is a simple web application that converts speech into text using the Web Speech API. The app listens for voice input and transcribes it to a text area where the user can see the results.

## Live Demo
You can see the live demo of the application at:  
[Voice To Text - Live Demo](https://somitraa.github.io/Voice-To-Text/)

## GitHub Repository
You can clone the project from the following GitHub repository:  
[Voice To Text - GitHub Repository](https://github.com/Somitraa/Voice-To-Text.git)

## Features
- **Speech Recognition**: The app listens to your voice input and transcribes it into text.
- **Simple User Interface**: A text area to display the transcribed text and a button to start voice recognition.
- **No Additional Tools Required**: Just use a browser that supports the Web Speech API (e.g., Google Chrome).

## Prerequisites
To run this project locally, you will need:
- A modern web browser with support for the Web Speech API (e.g., Google Chrome).
- An internet connection to load external resources if necessary.

## How to Use
1. Open the live demo link in your browser.
2. Click the "Click" button to start the voice recognition process.
3. Speak into your microphone.
4. The text will appear in the text area once the speech is recognized.

## Project Structure
This project contains the following files:

- **index.html**: The main HTML file containing the structure of the application.
- **style.css**: The CSS file for styling the application.
- **script.js**: The JavaScript file containing the logic for speech recognition.

### index.html
Contains the markup for the webpage including the text area and the button.

### style.css
Handles the visual presentation of the application. You can modify the styles in this file for a custom look.

### script.js
Uses the `SpeechRecognition` API to listen to the user's voice and transcribe it into text. It triggers the transcription when the "Click" button is pressed.

## How to Run Locally

1. Clone the repository:
    ```bash
    git clone https://github.com/Somitraa/Voice-To-Text.git
    ```
2. Navigate to the project directory:
    ```bash
    cd Voice-To-Text
    ```
3. Open `index.html` in a web browser to run the app locally.

## Technologies Used
- **HTML5**: For structure and layout.
- **CSS3**: For styling.
- **JavaScript**: For functionality (using the SpeechRecognition API).

## Contributions
Feel free to fork this repository and submit pull requests with improvements or bug fixes. If you encounter any issues, please open an issue in the repository.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements
- The Web Speech API, particularly the SpeechRecognition interface, is used for converting voice into text.

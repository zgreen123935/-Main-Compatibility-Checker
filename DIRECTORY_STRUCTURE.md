# Mysa Thermostat Compatibility Checker - Directory Structure

# Screen Hierarchy

1. Home (Compatibility Checker)
   │
   └─ 2. Steps Overview
      │
      └─ 3. Safety Warning
         │
         └─ 4. Thermostat Capture
            │
            └─ 5. Wiring Capture
               │
               └─ 6. Compatibility Analysis
                  │
                  └─ 7. Compatibility Result
                     │
                     └─ 8. Chat Interface (optional)

This hierarchy represents the main user flow through the application:

1. Users start at the Home screen, which introduces the Compatibility Checker.
2. They then see an overview of the steps they'll need to complete.
3. A safety warning is presented before proceeding to handle the thermostat.
4. Users are prompted to take a photo of their thermostat.
5. Next, they take a photo of the thermostat wiring.
6. The app then shows an analysis screen while checking compatibility.
7. Results of the compatibility check are presented.
8. Optionally, users can access a chat interface for further questions.

Each screen is implemented as a separate page in the `app/` directory, with corresponding components in the `components/` directory.


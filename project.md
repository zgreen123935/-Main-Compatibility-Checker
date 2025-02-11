# Mysa Thermostat Compatibility Checker - Project Structure

## Common Pages

- `/` (Home - Compatibility Checker)
- `/control-method` (Control Method Selection)
- `/steps` (Steps Overview - customized based on control method)
- `/analysis` (Compatibility Analysis)
- `/result` (Compatibility Result)
- `/chat` (AI Chat Interface - accessible throughout)

## Control Type Specific Paths

### 1. Wall Thermostat

1. `/control-method` (Select "Wall Thermostat")
2. `/steps?method=wall_thermostat` (Customized steps for wall thermostat)
3. `/safety-warning` (Safety instructions for wall thermostat)
4. `/capture/thermostat` (Capture thermostat photo)
5. `/capture/wiring` (Capture wiring photo)
6. `/analysis` (Analyze compatibility)
7. `/result` (Show compatibility result)

### 2. Remote Control

1. `/control-method` (Select "Remote Control")
2. `/steps?method=remote` (Customized steps for remote control)
3. `/capture/other` (Capture remote control details)
4. `/analysis` (Analyze compatibility)
5. `/result` (Show compatibility result)

### 3. Directly from Heater or AC

1. `/control-method` (Select "On the Heater")
2. `/steps?method=on_heater` (Customized steps for direct heater/AC control)
3. `/capture/other` (Capture heater/AC control details)
4. `/analysis` (Analyze compatibility)
5. `/result` (Show compatibility result)

## Notes

- The `/steps` page content should be dynamically generated based on the `method` query parameter.
- The `/capture/other` page should be flexible enough to handle both remote control and direct heater/AC control methods.
- The `/analysis` and `/result` pages should be able to process and display results for all control types.
- The `/chat` interface should be accessible from any page for user support.

## Potential Improvements

1. Consider adding a progress indicator to show users where they are in the process for each control type.
2. Implement a way for users to go back and change their control method selection without starting over completely.
3. Add more detailed capture steps for remote control and direct heater/AC methods if needed.
4. Consider adding a summary page before the final result, allowing users to review and confirm their inputs.


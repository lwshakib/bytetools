// Import the 'cn' (class name) combining utility function from the shared utils file
import { cn } from '@/lib/utils';

// Define a test suite specifically for checking the functionality of the 'cn' utility
// The 'describe' block groups related test assertions together logically
describe('cn utility', () => {
  
  // Define a test case to check basic string concatenation functionality
  it('combines classes', () => {
    // Call the cn utility with two basic string arguments: 'class1' and 'class2'
    // Assert that the result is precisely the two strings joined with a space
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  // Define a test case evaluating how conditional logic parameters are handled
  it('handles conditional classes', () => {
    // The cn utility handles falsy values and boolean logic inherently
    // 'true && "class2"' evaluates to 'class2', while 'false && "class3"' evaluates to 'false'
    // Assert that the final string only includes the classes that evaluated strictly to true ('class1' and 'class2')
    expect(cn('class1', true && 'class2', false && 'class3')).toBe(
      'class1 class2'
    );
  });

  // Define a test case ensuring Tailwind CSS specific utilities merge intelligently
  // This verifies that 'twMerge' behaves successfully within the 'cn' wrapper
  it('merges tailwind classes correctly', () => {
    // Attempt to merge two related Tailwind padding string properties
    // 'px-2' conflicts with 'px-4' (as they both define horizontal padding)
    // Assert that the newer parameter ('px-4') correctly overwrites the older parameter ('px-2')
    // while keeping the non-conflicting 'py-2' (vertical padding) intact
    expect(cn('px-2 py-2', 'px-4')).toBe('py-2 px-4');
  });
});

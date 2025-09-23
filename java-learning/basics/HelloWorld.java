/**
 * My First Java Program - Hello World
 * @author Student (Age 15)
 * @date September 23, 2025
 * Learning Focus: Basic Java syntax, compilation, and execution
 */
public class HelloWorld {
    public static void main(String[] args) {
        // Print a welcome message
        System.out.println("Hello, Java World!");
        System.out.println("Welcome to my Java learning journey!");

        // Let's try some basic variables
        String studentName = "Computer Science Student";
        int age = 15;
        boolean isLearning = true;

        System.out.println("Student: " + studentName);
        System.out.println("Age: " + age);
        System.out.println("Currently learning Java: " + isLearning);

        // Basic arithmetic
        int a = 10;
        int b = 5;
        System.out.println(a + " + " + b + " = " + (a + b));
        System.out.println(a + " - " + b + " = " + (a - b));
        System.out.println(a + " * " + b + " = " + (a * b));
        System.out.println(a + " / " + b + " = " + (a / b));
    }
}
import java.util.Random;
import java.util.Scanner;
public class practice{
    public static void main(String[] args){
        Scanner input = new Scanner(System.in);
        Random random = new Random();

        int guess;
        int attempts = 0;
        int randomNumber = random.nextInt(1, 11);


        System.out.println("Number Guessing Game");
        System.out.println("Guess a number between 1-10: ");


        do{

            System.out.println("ener a guess");
            guess = input.nextInt();
            attempts ++;

        }while(guess != randomNumber);


        System.out.print("you have won!!");
        System.out.print("congrats");

    }
}
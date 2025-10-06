import java.util.Random;
import java.util.Scanner;
public class guessnumbergame{
    public static void main(String[] args){
        Scanner input = new Scanner(System.in);
        Random random = new Random();

        int guess;
        int attempts = 0;
        int randomNumber = random.nextInt(1, 101);


        System.out.println("Number Guessing Game");
        System.out.println("Guess a number between 1-100: ");


        do{

            System.out.print("Enter a guess: ");
            guess = input.nextInt();
            attempts ++;

            if(guess < randomNumber){
                System.out.println("Too low guess higher");

            }

            else if(guess > randomNumber){
                System.out.println("Too high Try Lower");
            }
            else{
                System.out.println("RIGHTTT!!!  " + randomNumber);
                System.out.println("# of attempts " + attempts);
            }



        }while(guess != randomNumber);


       input.close();

    }
}
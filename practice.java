import java.util.Scanner;
public class practice{
    public static void main(String[] args){
        Scanner input = new Scanner(System.in);


        int number1,number2;
        int pluses,minuses,multi,divs;

        System.out.print("number1 = ? ");
        number1 = input.nextInt();

        System.out.print("number2 = ? ");
        number2 = input.nextInt();

        pluses = number1 + number2;
        minuses = number1 - number2;
        multi = number1 * number2;
        divs = number1/number2;

        System.out.println(pluses);
        System.out.println(minuses);
        System.out.println(multi);
        System.out.println(divs);



        input.close();

    }
}
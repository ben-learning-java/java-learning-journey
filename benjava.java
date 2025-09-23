import java.util.Scanner;
public class benjavas{
    public static void main (String[] args){
        Scanner input = new Scanner(System.in);
        int a,b,c;
        
        System.out.print("a=?");
        a = input.nextInt();

        System.out.println("b=?");
        b = input.nextInt();

        c = a+b;

        System.out.println("c="+c);



        input.close();
        

    }
}

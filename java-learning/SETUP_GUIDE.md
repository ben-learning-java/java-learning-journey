# Java Development Environment Setup Guide

## Step 1: Install Java Development Kit (JDK)

### Recommended: Eclipse Temurin (OpenJDK)

1. **Download JDK:**
   - Go to https://adoptium.net/
   - Select "Temurin 17 (LTS)" or "Temurin 21 (LTS)"
   - Choose "Windows x64"
   - Download the `.msi` installer

2. **Install JDK:**
   - Run the downloaded `.msi` file
   - Follow the installation wizard
   - **IMPORTANT:** Check "Set JAVA_HOME variable" option
   - **IMPORTANT:** Check "Add to PATH" option
   - Complete the installation

3. **Verify Installation:**
   Open Command Prompt (cmd) or VS Code terminal and run:
   ```cmd
   java -version
   javac -version
   ```
   You should see version information for both commands.

### Alternative: Oracle JDK
If you prefer Oracle JDK:
1. Go to https://www.oracle.com/java/technologies/downloads/
2. Download JDK 17 or 21
3. Follow similar installation steps

## Step 2: Configure VS Code for Java

### Install Required Extensions

1. **Open VS Code**
2. **Install Java Extension Pack:**
   - Press `Ctrl+Shift+X` to open Extensions view
   - Search for "Java Extension Pack"
   - Install the one by Microsoft (includes 6 extensions)

### Essential Extensions Included:
- **Language Support for Java™ by Red Hat**
- **Debugger for Java**
- **Test Runner for Java**
- **Maven for Java**
- **Project Manager for Java**
- **Visual Studio IntelliCode**

### Optional but Recommended:
- **Java Code Generators** - For boilerplate code
- **Java Decompiler** - For viewing compiled classes

## Step 3: Verify Your Setup

### Test with HelloWorld Program

1. **Open VS Code in your java-learning directory:**
   ```cmd
   cd C:\Users\ga054\Desktop\stuff\java-learning
   code .
   ```

2. **Open the HelloWorld.java file** in the `basics/` folder

3. **Compile and Run using VS Code:**
   - Method 1: Click the "Run" button that appears above the main method
   - Method 2: Press `F5` to debug
   - Method 3: Use terminal commands:
     ```cmd
     cd basics
     javac HelloWorld.java
     java HelloWorld
     ```

### Expected Output:
```
Hello, Java World!
Welcome to my Java learning journey!
Student: Computer Science Student
Age: 15
Currently learning Java: true
10 + 5 = 15
10 - 5 = 5
10 * 5 = 50
10 / 5 = 2
```

## Step 4: Configure Environment Variables (If Not Done Automatically)

### If JAVA_HOME is not set:

1. **Open System Properties:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click "Environment Variables"

2. **Set JAVA_HOME:**
   - Under "System variables", click "New"
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot` (adjust version)
   - Click OK

3. **Update PATH:**
   - Find "Path" in System variables, click "Edit"
   - Click "New" and add: `%JAVA_HOME%\bin`
   - Click OK

4. **Restart VS Code** to pick up the new environment variables

## Step 5: VS Code Keyboard Shortcuts for Java

### Essential Shortcuts:
- `F5` - Start debugging
- `Ctrl+F5` - Run without debugging
- `Ctrl+Shift+P` - Command palette
- `F12` - Go to definition
- `Ctrl+.` - Quick fix
- `Ctrl+Space` - IntelliSense
- `Ctrl+Shift+O` - Go to symbol
- `Ctrl+K Ctrl+F` - Format selection
- `Shift+Alt+F` - Format document

### Java-specific Commands (via Ctrl+Shift+P):
- "Java: Run Tests"
- "Java: Debug Tests"
- "Java: Create Java Project"
- "Java: Show Type Hierarchy"

## Step 6: Project Structure Best Practices

### For School Assignments:
```
java-learning/
├── basics/
│   ├── variables/
│   ├── control-flow/
│   ├── methods/
│   └── arrays/
├── exercises/
│   ├── week1/
│   ├── week2/
│   └── ...
├── projects/
│   ├── calculator/
│   ├── grade-manager/
│   └── ...
└── examples/
    ├── syntax-examples/
    └── design-patterns/
```

### Naming Conventions:
- **Classes:** PascalCase (e.g., `StudentManager`)
- **Variables/Methods:** camelCase (e.g., `studentName`)
- **Constants:** UPPER_CASE (e.g., `MAX_STUDENTS`)
- **Packages:** lowercase (e.g., `com.school.project`)

## Step 7: Troubleshooting Common Issues

### "java is not recognized as an internal or external command"
- Java is not in your PATH
- Reinstall JDK with PATH option checked
- Or manually add to PATH as described above

### VS Code doesn't recognize Java files
- Install Java Extension Pack
- Restart VS Code
- Open the folder containing your Java files

### "The import cannot be resolved"
- Check if you're using the correct class names
- Ensure proper package structure
- Clean and rebuild: `Ctrl+Shift+P` → "Java: Rebuild Projects"

### Compilation errors
- Check syntax carefully
- Ensure class name matches filename
- Verify proper closing of braces and semicolons

## Next Steps

1. **Complete the setup verification**
2. **Start with basic Java concepts** in the `basics/` folder
3. **Update your progress** in `CLAUDE.md`
4. **Practice regularly** with small programs
5. **Ask Claude for help** when you encounter challenges!

---

**Setup Complete!** 🎉

You're now ready to start your Java programming journey. Remember to document your progress in the CLAUDE.md file and don't hesitate to experiment with the code examples provided.

Happy coding! 🚀
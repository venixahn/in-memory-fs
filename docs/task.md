# Overview

Choose a language of your choice (excluding bash, haskell, or scala)
Feel free to use small libraries where appropriate instead of re-inventing the wheel
Feel free to look things up or use other reference material as you would when working normally
Please refrain from using any AI coding tools
Please make this look as close to real production code you would submit for code review (e.g feel free to refactor aggressively, use helper functions, etc)
Submit your code via github. Please include a README that includes how to get your code running / tested.

## We’ll be evaluating for the following:

Does the program exhibit good design techniques?
Is the code easy to read and understand? (style, comments, maintainability, etc)
Do you use data structures and algorithms that would allow your program to work under moderately high volume – i.e is your code scalable?
Is this code we’d want in our production codebase?
Do you handle error cases appropriately?

## Prompt

Build an in-memory filesystem! This is a simplified file system that supports both files and directories. You don’t have to work with any actual files, everything will just be contained in-memory.

Write functions that correspond to familiar file system commands. We only care about the capabilities, so you may choose to combine multiple capabilities into one function, or even split up one capability amongst multiple functions (up to you). You can leave comments and TODOs if there are ideas or issues you want to discuss or point out, but don’t have time to implement/fix, or aren’t quite sure how.

Remember to consider edge and error cases in your design. You can decide the best way to handle them, even if that may just be throwing an exception.

- Change the current working directory. The working directory begins at '/'. You may traverse to a child directory or the parent.
- Get the current working directory. Returns the current working directory's path from the root to console. Example: ‘/school/homework’
- Create a new directory. The current working directory is the parent.
- Get the directory contents: Returns the children of the current working directory. Example: [‘math’, ‘history’, ‘spanish’]
- Remove a directory. The target directory must be among the current working directory’s children.
- Create a new file: Creates a new empty file in the current working directory.
- Write file contents: Writes the specified contents to a file in the current working directory. All file contents will fit into memory.
- Get file contents: Returns the content of a file in the current working directory.
- Move a file: Move an existing file in the current working directory to a new location (in the same directory).
- Find a file/directory: Given a filename, find all the files and directories within the current working directory that have exactly that name.

Initially, the only directory in your virtual filesystem should be the root directory, '/' and the current working directory should also point here.

## Example operations (these could be function calls, or anything you like):

- make "school" directory
- change directory to "school"
- get working directory => "/school"
- make "homework" directory
- change directory to "homework"
- make "math" directory
- make "lunch" directory
- make "history" directory
- make "spanish" directory
- delete "lunch" directory
- get working directory contents => ["math", "history", "spanish"]
- get working directory => "/school/homework"
- change directory to parent
- make "cheatsheet" directory
- get working directory contents => ["homework", "cheatsheet"]
- delete "cheatsheet" directory
- change directory to parent
- get working directory => "/"

## Extensions

Once you have the basic virtual filesystem working, please add on some more capabilities.

- Multiple clients using the same filesystem in parallel
  - Must work for > 500 “clients” performing operations at the same time
- Symlinks and hardlinks
  - Add symlinks. Symlinks contain a path referencing the file or directory they represent. Reading a symlink’s file/directory contents should have the same results as reading the contents of the item it references instead.
  - Add hardlinks. Hardlinks of a file/directory all point to the same file contents or directory children even if the original file/directory moves to a new location.

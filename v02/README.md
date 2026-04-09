# Start of a new cleaned up version

Just started, so it has little functionality.  First priority was to clean up the command line interface, add history so up and down arrows can be used to re-enter a former command.  Note:  The cli starts up in main mode and can be switched to other modes by entering one of the mode names such as calc or c- for short.  The various sub mode functions can also be ran one time by adding the parameters to the mode name, which will perform the function and return to current mode.

I have created a num.io.js that deals with the input and eventually the output of numbers.  This will allow the cli to support various number formats.  The number formats recognized are hex ( 0x___, $___ ), octal ( 0o___, 0q___ ), binary ( 0b___, %___ ), decimal ( #___ ).  The default is hex, which is why it is necessary to put a # in front of decimal numbers.  I may in the future add a command to change the default.  Also, the # can be placed in front of all the non-decimal numbers as long as their prefix is then used, ie, 4fd, $4fd, #$4fd, 0x4fd, #0x4fd, are all recognized as hex number 4fd.

I know it is generally not recommended, but I have created globals for many of those often required functions.  These functions include hex0 ( output in hex format ), hex2 ( output in hex and pad start with 0s to length 2 ), hex4...hex16 ( just longer versions of hex2 ), bin0, bin32 ( similar to hex, but in binary format ), others to be mentioned later.  Most importantly is pnum, which can be used to parse all numbers using the supported formats.

The io/io.js also provides the globals write and writeline, to direct all output through the method in io.  This will allow the output to be processed further if necessary.  As an example, baud function in v01 of the emulator requires all output can be redirected to allow the change in output speed.  This also allows all output to be saved to a session log if desired.

I also wanted to incorporate a calculator into the new system, as a lot of times it is necessary to perform math on hex numbers.  The calculator can be added by typing calc.  This will enter calc mode and change the prompt to c->.  The main command will return the main mode with a prompt of >>>.  The calculator uses a rpn style of entry with a number of forth like commands added.  To see the list of commands enter the words command.

Made a very limited file mode, entered by typing file or f-.  Supports commands open, close, stat, d/dump.

A few other stubs of other modes have been added.  Note, the structure may still change.


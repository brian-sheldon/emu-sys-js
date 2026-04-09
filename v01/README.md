
# Using emu-sys-js

This is just some basic usage instructions.  This system runs using nodejs.

Clone this repository.

```
> cd emu-sys-js/v01/
> node emu

>>> zz
>>> b
>>> on
press PageUp to connect keyboard input to system
a: dir
press PageDown to connect keyboard to monitor
>>> bye
```
## Monitor Command Reference (very incomplete)
Note: Some commands will autorepeat and display the next data.
There is currently no way to change what disk is in the drive.
```
ctrl-d or bye     ; exits the system
zz                ; configures a cpm system, mounts some disks
                  ; reason for weird name is that it is easy to type
                  ; quickly, meant to speed up development
b                 ; loads a boot sector into memory
on                ; starts the cpu
off               ; stops the cpu
PageUp            ; connects keyboard to the system
PageDown          ; connects keyboard to the monitor
loops <num>       ; returns or sets the number of instruction to run
                  ; per frame, I believe the frame time is 8 ms, about
                  ; 120 frames/second
                  ; the default value is somewhat low as I wasn't concerned
                  ; with speed during development
baud <rate>       ; emulates what it is like using a slow connection
                  ; 0 resets to normal
led <addr>        ; display byte at addr in an led like display
d <addr>          ; display contents of memory at a given address
                  ; command autorepeats if enter pressed
l <addr>          ; shows disassembly at given address
stat              ; displays the cpu status, including registers
                  ; and verious run/stop conditions such as
                  ; on (set by on cmd), wait (waiting for keyboard input),
                  ; stop (1 if stopat triggered), halt (set 1 by halt inst)
step <num>        ; step through num instructions
                  ; displays the instruction executed, registers after and
                  ; total count steps and clock cycles
step 1053         ; this is the number of instructions that cp/m needs to load
                  ; cp/m into memory.  next it will jump to fa00, cp/m start
haltclr           ; clear any cpu halt state
stopat <addr>     ; set cpu stop at addr
stopclr           ; clear cpu stopat
mclr              ; clears the mlist
msave             ; save the mlist to file
mlist             ; list all memory addresses accessed
                  ; first column is how many times accessed up to a limit
cclr              ; clears the clist
csave             ; saves the csave
clist             ; disassembly of all executed opcodes in memory
                  ; first column is how many times accessed up to a limit
                  ; a label will be placed at any identified code entrance points
disk <trk> <sec>  ; displays contents of a disk sector
                  ; once done, just hitting enter will repeat
                  ; the command and display next sector
                  ; this command is aware of the cp/m format and will
                  ; determine next sector based on where on the disk it
                  ; is
bt                ; similar to disk, but sets location to boot sector
dir               ; similar to disk, but goes to trk, sec of
                  ; cp/m directory extent area
extents           ; list all the extents of the disk
extent <num>      ; list a single extent
fat               ; displays a somewhat crude fat table
sdir              ; output a sorted dir of the current disk similar to the
                  ; sdir command in cp/m
colors            ; display all terminal colors
----- some extra features, not implemented well
--- trs-80 model 1 partial emulation, do this sequence to run
> node emu
>>> zz
>>> on
PageUp
--- at this point basic commands can be run, but the emulation is only
partially implemented.  There is no way to enter some keys as the keyboard
is not emulated, the basic has been hacked to get keys from the stdio and
send output to the stdout, so no break key or clear key.  Also, there are not special characters like the
graphics characters.  The rom is also not write protected.
--- trs-80 forth by Lawrence Kesteloot, do this sequence to run
> node emu
>>> zz
>>> cpu forth
>>> on
PageUp
--- type words to see what forth words are implemented
```
## CP/M Command Reference (very incomplete)
```
dir               ; list files on current disk
a: b: etc         ; changes to another drive, note, it may lock up if drive does not exist
m <cmd>           ; run a monitor command without leaving the system, m sdir will run a
                  ; sorted dir on the current drive, note, written in javascript
```




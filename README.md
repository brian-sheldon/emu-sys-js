# emu-sys-js
An emulation system with a command line interface providing access to a monitor and tools all in javascript

This is basically a small command shell, with lots of commands to examine disks, monitor a running system, display registers, cpu state, examine memory, display traces of memory access and instruction addresses, etc.  I wrote it in javascript as I wanted a reasonable portable system and most of all, I wanted it to be easy to update.  Nothing like only needed to write a few lines of javascript to quickly add a new way to see what is happening in an emulated system as well as debug the system.  This all started last year in June, as a fairly small project.  Five weeks later, I had 5000 lines of javascript, all typed in on the touch screen on my phone, using vim running on termux.  At this point, I had an enviroment, capable of running cp/m, using various libraries of cpu emulators and disassemblers.  Some of these libraries are still a work in progress to get working with my environment, as they often have different api's.

Note:  As much as possible, I have tried to minimize any changes to the original code in these various libraries, but to quickly get this working, I have made varying degrees of modifications.  I hope to eventually go back and undo these changes and use some form of interface to sync up the various api's.

# status

In the beginning, this emulation was using z80 cpu emulation, then I wanted to try an 8080 emulator known for its accuracy and test this with some tools. In the process, the z80 emulation was nolong compatible.  Then one day I wanted to try some z80 code and quickly changed things again.  I did manage to get both cpu emulations working, but at the expense of a lot of quick changes that probably need some cleanup and possible better structure.  But that was a while ago, so I don't remember exactly how I switch.  But I decided to make my first upload of this code anyway.  Also, there are a lot of weird commands in the cli as I was doing a lot of experimenting and did not put much thought into making them.

I am also starting a whole new from the bottom versio of this, where it will be a lot better structured, but it may be a while before I start uploading it.

## How this Started

I initially justed wanted an easy way to examine disk sectors in an disk image file, initially "cp/m" disk images.  Plus, I wanted to be able to quickly navigate.  So I created a small command shell, with variables to store the next track and sector.  Following this, I created a command with two parameters, "disk track sector".  If no paramters were given, it would just get the track and sector from the current stored values.  Each time "disk" was entered, it would update these stored values.  In addition, I added a variable, "defcmd", and set it to "disk".  Then, just hitting "enter", would re-run the "disk" command.

It evolved from there, I added a "dir" command to set the track and sector to the first sector where the disk directory was stored, technically, the extents.  And again, hitting "enter" would re-run the "disk" command, going to the next sector for the directory.  At this point, I added logic to support the logical sectors typically used on some tracks of a "cp/m" disk.  This logic would take into account tracks both using logical sectors and those without.  Later I added commands to navigate to where the files blocks are kept.  For mostly debugging purposes I added commands to translate between logical and physical sectors and display the results.

Then came some file commands, that would navigate through the blocks for individual files and rotate back to the beginning after last block was displayed.  Again, the "disk" command automatically performed the display and update to the next sector of interest.  The "file" command, in the same way as the "dir" command just set the track and sector start points for the "disk" function.  I also added commands to list individual and all "extents".  And for fun, I wrote an "sdir" command with output similar to the "cp/m sdir" command, but formatted to fit a 60 column screen.

Now, before this all started, I had some very roughly pieced together emulators, built from code in a number of other projects I had come across.  One, was an online TRS-80 Model 3 emulator, written as a web app using javascript.  I wanted to be able run this emulator in the command line using nodeJS.  Second, I had built an Android app to run a cp/m emulator on my phone, one I found online, modifying to both use the original web storage mechanism, plus with file access to my phones storage.

After a bit of thought, I wondered how quickly I would be able to get at least one of these emulators running within this command shell.  So, I quickly started adding pieces of the cp/m emulator, after finding out how to hook the io into this nodeJS app, instead of the original hook into a web based vt100 emulator.  Plus I had to once again change the disk access to support nodeJS.  Surprisingly, this came together fairly quickly.  Initially, I had this running with a z80 emulator, from the TRS-80 emulator, as I was more familiar with the api.  Having this cp/m system running, I was now able to insert a disk with utilities to thoroughly test how accurately the cpu ran intel 8080 code.  Not surpisingly, the z80 emulator failed the test.  This is when I found an Intel 8080 emulator that was apparently able to pass these tests.  After a bit of work, adjusting to the new api, I had this Intel 8080 emulator working, and yes, it passed the tests.  Development of my environment continued with this 8080 emulator.

Having this convenient environment to run cp/m, I then started adding in all kinds of features to monitor and trace the operation of the cpu.  Most of the functions I created were in place at the end of the initial five weeks of development.  Although the code was reasonably well separated into small modules, it was still not ideal and as with most quick projects, was quite messy in places.

## Recent Development

I pretty much put this project aside for about a year.  Then I thought, maybe others could make some use of this.  I feel this is mostly useful for those wanting to get and idea of how some of these retro systems worked.  Given that the currently systems are relatively small compared to modern systems, they lend themselves to learning the basics of cpu's, disks, operating systems.

So I recently began cleaning up the code and reorganizing the structure a bit.  The first challenge was building a new module, to act as a hub for the various cpu modules I am wanting to switch between.  So far, I managed to get the one Intel 8080 module and the one z80 module running.  Mostly, I modified the z80 module to have a similar api to the 8080 module, as the z80 module was already heavily modified as it was originally embedded within the originally TRS-80 emulator.







When working with [OpenStack](https://www.openstack.org/) instances, it is common to need to get data in and out of running instances. Most times this isn't an issue and tools like [scp](http://linux.die.net/man/1/scp) can be used. 

Though uncommon, scenarios exist where the instances you're spawning are on subnets with network firewall restrictions, where `scp` won't work. Networking restrictions mean a little creativity is needed. 

Assume we have a VM with one NIC on a completely firewalled subnet... (facepalm)

Options:

1. New subnet on `192.168.0.x` and add it to the running machine
2. Mount a device onto the [virsh](http://linux.die.net/man/1/virsh) domain
3. Use [TigerVNC](http://tigervnc.org/) to copy/paste text..

Option 1 requires new resource creation and possibly? a restart.

Option 3 requires making sure [vncconfig](http://tigervnc.org/doc/vncconfig.html) is properly installed on OpenStack hosts, which they aren't by default. Also, this won't work for binary files.

Seems like option 2 is the most non-intrusive solution. Steps below:

1. Create iso

  ```
  $ ls
  foo  bar

  $ gensioimage -o ~/myiso.iso .
  I: -input-charset not specified, using utf-8 (detected in locale settings)
  Total translation table size: 0
  Total rockridge attributes bytes: 0
  Total directory bytes: 0
  Path table size(bytes): 10
  Max brk space used 0
  174 extents written (0 MB)

  # libvrt requires images to be within special folder
  $ cp myiso.iso /var/lib/libvrt/images/myiso.iso
  ```

2. Find virsh domain name for instance

  ```
  $ openstack server show <vmname> | grep -o "instance-.*\s"
  instance-00000346
  ```

3. Mount virtual cdrom device

  ```
  $ virsh attach-disk instance-00000346 /var/lib/libvrt/images/myiso.iso hda \
  --type cdrom \
  --mode readonly
  Disk attached successfully
  ```

4. If you need to re-start the instance, avoid using nova commands to boot it. The nova commands will wipe any custom edits you made to the virsh domain. To start an instance, use virsh commands instead:

  ```
  # Let nova shutoff the instance
  $ nova stop <vmname>

  # Make nova think the instance is active
  $ nova reset-state --active <vmname>

  # Use virsh to start the instance with edited settings
  $ virsh start <domainname>
  ```

5. Unmount device

  ```
  $ virsh detach-disk <domainname> hda --config
  Disk detached successfully
  ```


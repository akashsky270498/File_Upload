# 🐧 COMPLETE LINUX COMMANDS MASTER HANDBOOK
> Comprehensive, Production-Grade Reference for Linux Commands, Shell Utilities, and DevOps Workflows.

---

## 📋 TABLE OF CONTENTS
1. 📂 [Directory Navigation & Inspection](#1-directory-navigation--inspection)
2. 📄 [File Creation, Inspection & Management](#2-file-creation-inspection--management)
3. 🔍 [Searching, Filtering & Text Processing (Power Tools)](#3-searching-filtering--text-processing)
4. ⚡ [System Monitoring, Memory & Process Control](#4-system-monitoring-memory--process-control)
5. 🌐 [Networking, HTTP APIs & Port Management](#5-networking-http-apis--port-management)
6. 🔒 [Permissions, Ownership & Security](#6-permissions-ownership--security)
7. 📦 [Archiving, Compression & File Transfer](#7-archiving-compression--file-transfer)
8. ⚙️ [Environment, Shell Productivity & Operators](#8-environment-shell-productivity--operators)
9. 🐳 [Docker & Container CLI Operations](#9-docker--container-cli-operations)
10. 💡 [DevOps & Real-World Troubleshooting Workflows](#10-devops--real-world-troubleshooting-workflows)

---

## 1. 📂 DIRECTORY NAVIGATION & INSPECTION

| Command | Syntax / Example | Explanation & Usage |
| :--- | :--- | :--- |
| **`pwd`** | `pwd` | **Print Working Directory** - Displays the full absolute path of your current location. |
| **`ls`** | `ls` | List files and directories in current location. |
| **`ls -l`** | `ls -l` | Long format listing (shows permissions, owner, file size, timestamp). |
| **`ls -la`** | `ls -la` | List **ALL** files including hidden dotfiles (`.env`, `.gitignore`). |
| **`ls -lh`** | `ls -lh` | Shows file sizes in human-readable format (KBs, MBs, GBs). |
| **`ls -lt`** | `ls -lt` | Sort files by modified time (newest files first). |
| **`cd`** | `cd /mnt/d/Workspace/Task` | **Change Directory** to specified path. |
| **`cd ..`** | `cd ..` | Move up 1 directory (parent folder). |
| **`cd ../..`** | `cd ../..` | Move up 2 directory levels. |
| **`cd ~`** | `cd ~` | Change directory to Current User's Home directory (`/home/username`). |
| **`cd -`** | `cd -` | Toggle back to the previous directory you were in. |
| **`mkdir`** | `mkdir my_folder` | Make Directory - Creates a new folder. |
| **`mkdir -p`** | `mkdir -p src/common/middleware` | Create nested parent directories in a single command. |
| **`rmdir`** | `rmdir empty_folder` | Remove an empty directory. |
| **`tree`** | `tree -L 2` | Visualizes folder hierarchy up to 2 levels deep (requires `apt install tree`). |

---

## 2. 📄 FILE CREATION, INSPECTION & MANAGEMENT

| Command | Syntax / Example | Explanation & Usage |
| :--- | :--- | :--- |
| **`touch`** | `touch server.js` | Creates an empty file or updates the timestamp of an existing file. |
| **`cat`** | `cat file.txt` | Concatenate & Print full contents of a file to terminal. |
| **`cat -n`** | `cat -n server.js` | Print file contents with line numbers. |
| **`head`** | `head -n 20 app.log` | Displays the first 20 lines of a file. |
| **`tail`** | `tail -n 30 app.log` | Displays the last 30 lines of a file. |
| **`tail -f`** | `tail -f /var/log/nginx/access.log` | ⚡ **Follow Mode** - Live streams new log lines in real-time as they arrive! |
| **`less`** | `less large_file.log` | Page-by-page file viewer (Scroll with arrows, press `/` to search, `q` to exit). |
| **`cp`** | `cp file1.txt file2.txt` | Copy a file to another location or name. |
| **`cp -r`** | `cp -r src/ src_backup/` | Copy folder recursively with all subfolders and files. |
| **`mv`** | `mv old_name.txt new_name.txt` | Rename a file/folder OR move it to another directory. |
| **`rm`** | `rm file.txt` | Remove / Delete a file. |
| **`rm -rf`** | `rm -rf dist/` | 🚨 **Force Recursive Delete** - Deletes folder and ALL contents permanently. |
| **`ln -s`** | `ln -s /path/to/target link_name` | Create a Symbolic Link (shortcut) to a file or directory. |
| **`stat`** | `stat file.txt` | Displays detailed file metadata (Inodes, Access/Modify/Change timestamps). |
| **`wc`** | `wc -l file.txt` | Word Count - Count total lines (`-l`), words (`-w`), or bytes (`-c`). |

---

## 3. 🔍 SEARCHING, FILTERING & TEXT PROCESSING

| Command | Syntax / Example | Explanation & Usage |
| :--- | :--- | :--- |
| **`grep`** | `grep "PORT" .env` | Search for matching pattern/text inside a file. |
| **`grep -i`** | `grep -i "error" app.log` | Case-insensitive search. |
| **`grep -rn`** | `grep -rn "httpRequestsTotal" src/` | **Recursive Line Search** - Searches all files in folder and shows line numbers. |
| **`grep -v`** | `grep -v "^#" .env` | Invert Match - Prints lines that DO NOT match (e.g., skip comments). |
| **`find`** | `find . -name "*.ts"` | Search for files by filename or extension recursively. |
| **`find -type d`** | `find . -type d -name "config"` | Search specifically for directories matching name. |
| **`find -mtime`** | `find /logs -mtime -7` | Find files modified in the last 7 days. |
| **`awk`** | `awk '{print $1, $4}' access.log` | Text Extraction - Extract specific columns from text streams. |
| **`sed`** | `sed -i 's/foo/bar/g' file.txt` | Stream Editor - Global search & replace string inside file in-place. |
| **`cut`** | `cut -d',' -f1 data.csv` | Cut out specific fields using a delimiter. |
| **`sort`** | `sort file.txt` | Sort lines alphabetically or numerically (`sort -n`). |
| **`uniq`** | `sort list.txt \| uniq -c` | Filter out duplicate lines (use `uniq -c` to count occurrences). |
| **`xargs`** | `find . -name "*.tmp" \| xargs rm` | Pass output list of previous command as arguments to next command. |

---

## 4. ⚡ SYSTEM MONITORING, MEMORY & PROCESS CONTROL

| Command | Syntax / Example | Explanation & Usage |
| :--- | :--- | :--- |
| **`free -h`** | `free -h` | Display Total, Used, and Free RAM memory in Human-Readable format. |
| **`df -h`** | `df -h` | Display Total Disk Space usage across all mounted file systems. |
| **`du -sh`** | `du -sh node_modules/` | Display total Disk Usage of a specific folder or file. |
| **`top`** | `top` | Live System Task Manager - CPU & RAM utilization by process (Press `q` to exit). |
| **`htop`** | `htop` | Interactive, color-coded task manager (requires `apt install htop`). |
| **`uptime`** | `uptime` | Shows how long system has been running and CPU Load Averages (1m, 5m, 15m). |
| **`ps aux`** | `ps aux` | Lists all running processes with PID, CPU %, Memory %, and command path. |
| **`ps aux \| grep`** | `ps aux \| grep node` | Find Process ID (PID) of a specific running application. |
| **`kill`** | `kill 12345` | Gracefully send termination signal (SIGTERM) to PID 12345. |
| **`kill -9`** | `kill -9 12345` | 🚨 **Force Kill** - Immediately terminate unresponsive process (SIGKILL). |
| **`killall`** | `killall node` | Kill all processes matching the name. |
| **`lsof`** | `lsof -i :5000` | List Open Files / Ports - Find which process is occupying Port 5000. |
| **`fuser`** | `fuser -k 5000/tcp` | Kill process running on Port 5000 directly. |

---

## 5. 🌐 NETWORKING, HTTP APIS & PORT MANAGEMENT

| Command | Syntax / Example | Explanation & Usage |
| :--- | :--- | :--- |
| **`curl`** | `curl http://localhost:5000/health` | Send HTTP GET request to API endpoint. |
| **`curl -i`** | `curl -i http://localhost:5000/health` | Include HTTP Response Headers in output. |
| **`curl -X POST`** | `curl -X POST http://localhost:5000/login -H "Content-Type: application/json" -d '{"email":"test"}'` | Send HTTP POST request with JSON payload and headers. |
| **`wget`** | `wget http://example.com/file.zip` | Download files directly from the web to terminal. |
| **`ping`** | `ping google.com` | Test network latency and reachability to a host. |
| **`ss -tulpn`** | `ss -tulpn` | **Socket Statistics** - Shows all open listening ports and associated processes. |
| **`netstat`** | `netstat -tulpn` | Displays active network connections and listening ports. |
| **`ip a`** | `ip a` | Displays IP addresses of all network interfaces (eth0, wlan0, docker0). |
| **`dig`** | `dig google.com` | DNS Lookup - Resolves domain name to IP addresses. |
| **`nc`** | `nc -zv localhost 5000` | **Netcat** - Test if specific TCP port is open and reachable. |

---

## 6. 🔒 PERMISSIONS, OWNERSHIP & SECURITY

| Command | Syntax / Example | Explanation & Usage |
| :--- | :--- | :--- |
| **`chmod`** | `chmod +x script.sh` | Change Mode - Grants Executable permissions to file. |
| **`chmod 755`** | `chmod 755 script.sh` | Read/Write/Exec for Owner; Read/Exec for Group & Others. |
| **`chmod 600`** | `chmod 600 id_rsa` | Read/Write for Owner ONLY (Required for SSH private keys). |
| **`chown`** | `chown akash:akash file.txt` | Change Owner - Changes file owner and group. |
| **`chown -R`** | `chown -R www-data:www-data /var/www` | Change owner recursively for folder and all sub-items. |
| **`sudo`** | `sudo apt update` | Execute command with Superuser (Root) privileges. |
| **`whoami`** | `whoami` | Prints current logged-in username. |
| **`id`** | `id` | Displays User ID (UID), Group ID (GID), and groups. |

---

## 7. 📦 ARCHIVING, COMPRESSION & FILE TRANSFER

| Command | Syntax / Example | Explanation & Usage |
| :--- | :--- | :--- |
| **`tar -czvf`** | `tar -czvf archive.tar.gz /folder` | **Compress** folder into a gzip `.tar.gz` archive file. |
| **`tar -xzvf`** | `tar -xzvf archive.tar.gz` | **Extract** `.tar.gz` compressed archive. |
| **`zip -r`** | `zip -r archive.zip folder/` | Compress folder into `.zip` format. |
| **`unzip`** | `unzip archive.zip` | Unpack `.zip` archive. |
| **`scp`** | `scp file.txt user@server:/path` | Secure Copy - Transfer file to remote server via SSH. |
| **`rsync`** | `rsync -avz src/ user@server:/dest` | Sync folders efficiently to remote server (transfers only deltas). |

---

## 8. ⚙️ ENVIRONMENT, SHELL PRODUCTIVITY & OPERATORS

| Command / Symbol | Syntax / Example | Explanation & Usage |
| :--- | :--- | :--- |
| **`export`** | `export NODE_ENV=production` | Sets environment variable for current shell session. |
| **`env`** | `env` | Displays all active environment variables. |
| **`echo`** | `echo $PATH` | Print text or variable value to terminal screen. |
| **`alias`** | `alias dps="docker ps"` | Creates custom shortcut command alias in shell. |
| **`history`** | `history \| grep docker` | Shows list of all previously executed terminal commands. |
| **`clear`** | `clear` (or `Ctrl + L`) | Clears terminal screen buffer. |
| **`which`** | `which node` | Shows absolute path of executable program. |
| **`pipe ( \| )`** | `cat app.log \| grep "ERROR"` | Passes stdout of left command as stdin to right command. |
| **`redirect ( > )`** | `echo "hello" > file.txt` | Overwrites file with command output. |
| **`append ( >> )`** | `echo "log entry" >> app.log` | Appends command output to end of file without overwriting. |
| **`and ( && )`** | `npm run build && npm start` | Runs second command ONLY if first command succeeds. |
| **`or ( \|\| )`** | `cd folder \|\| mkdir folder` | Runs second command ONLY if first command fails. |
| **`bg / fg`** | `bg` / `fg` | Move job to background or bring back to foreground. |

---

## 9. 🐳 DOCKER & CONTAINER CLI OPERATIONS

| Command | Syntax / Example | Explanation & Usage |
| :--- | :--- | :--- |
| **`docker ps`** | `docker ps` | List all running Docker containers. |
| **`docker ps -a`** | `docker ps -a` | List ALL containers (including stopped/exited ones). |
| **`docker logs`** | `docker logs omnimedia_nginx` | View stdout logs of container. |
| **`docker logs -f`** | `docker logs -f omnimedia_backend` | Follow live container logs stream. |
| **`docker exec`** | `docker exec omnimedia_nginx nginx -t` | Execute a single command inside running container. |
| **`docker exec -it`** | `docker exec -it omnimedia_nginx sh` | Open interactive shell terminal inside container. |
| **`docker restart`** | `docker restart omnimedia_prometheus` | Restart a running container. |
| **`docker stop`** | `docker stop omnimedia_redis` | Stop a running container gracefully. |
| **`docker-compose up -d`** | `docker-compose up -d` | Build & Start all services in background. |
| **`docker-compose down`** | `docker-compose down` | Stop and remove all container stack services and networks. |
| **`docker system prune`** | `docker system prune -f` | 🧹 Clean unused containers, networks, and dangling images. |

---

## 10. 💡 DEVOPS & REAL-WORLD TROUBLESHOOTING WORKFLOWS

### Scenario A: Find Which Process is Hogging Port 5000 & Kill It
```bash
# 1. Identify PID using port 5000
lsof -i :5000

# 2. Kill the process by PID
kill -9 <PID>
```

### Scenario B: Live Debug Nginx HTTP Errors
```bash
# Stream Nginx error logs live while testing endpoint
docker exec -it omnimedia_nginx tail -f /var/log/nginx/error.log
```

### Scenario C: Search for API Route across Entire Project Codebase
```bash
# Search for "/api/v1/search" recursively in src/ directory with line numbers
grep -rn "/api/v1/search" src/
```

### Scenario D: Check System RAM & Disk Space before Deployment
```bash
# Check Memory usage in MB/GB
free -h

# Check Disk space
df -h
```

---
*Created for OmniMedia Project Development & DevOps Operations.*

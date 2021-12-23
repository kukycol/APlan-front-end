### 部署过程

##### 用到的工具

- VMware Workstation Pro虚拟机
- FinalShell ssh连接工具
- WebStorm 2021.2.3 vue前端开发工具

##### 运行项目文件前的准备

1. VMware Workstation Pro虚拟机中安装的centos7

   ```
   #安装进程查看工具
   yum install net-tools
   
   #安装wget下载工具
   yum install wget
   ```

3. centos7安装nginx

   ```
   #参考博客 地址：https://blog.csdn.net/qq_37345604/article/details/90034424
   
   #安装nginx前依赖准备
   yum -y install gcc
   yum install -y pcre pcre-devel
   yum install -y zlib zlib-devel
   yum install -y openssl openssl-devel
   
   #下载ng包
   wget http://nginx.org/download/nginx-1.9.9.tar.gz  
   
   #解压ng包
   tar -zxvf  nginx-1.9.9.tar.gz
   
   #切换到解压后的目录下后逐一进行下面三个命令
   ./configure
   make
   make install
   
   #启动
   #切换到安装目录/usr/local/nginx/sbin运行下面的命令
   ./nginx
   ```


##### 运行项目

###### 部署前端

```
#使用webstorm执行npm run build:prod命令打包成dist文件夹
#上传至centos服务器，至于上传到哪个目录下，根据自己而定

#配置ng
#内容
    server {
    	listen       9527;
    	server_name  127.0.0.1;
    	root         /usr/local/nginx/html/9527/dist;
    	add_header X-Frame-Options sameorigin always;

  
    location / {
    }
        
	# 跨域配置
	location /prod-api {
		rewrite  ^/prod-api/(.*)$ /$1 break;
		proxy_pass   http://127.0.0.1:8986;
    	}
        
    }
    
#切换到安装目录/usr/local/nginx/sbin运行下面的命令重载ng配置
./nginx -s reload

#关闭centos防火墙或者放行9527端口
```

##### centos命令

```
#防火墙端口放行
firewall-cmd --zone=public --add-port=8003/tcp --permanent

#放行后重载防火墙配置文件
firewall-cmd --reload

#查看放行端口列表
firewall-cmd --list-ports

#查看防火墙状态
systemctl status firewalld

#查看进程及端口信息
netstat -tunlp
```

##### docker命令

```
#设置docker容器自启动
docker update --restart=always 容器id/容器名称

#取消docker容器自启动
docker update --restart=no 容器id/容器名称

#查看本地镜像库
docker images

#查看正在运行的容器
docker ps

#查看全部容器
docker ps -a

#查看容器运行日志
docker logs 容器id/容器名称

#查看实时容器日志
docker logs -f 容器id/容器名称
```


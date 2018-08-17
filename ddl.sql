таблицы: 

'passwords', 'CREATE TABLE `passwords` (\n  `password` varbinary(1000) DEFAULT NULL,\n  `username` varchar(1000) DEFAULT NULL,\n  `userconstantid` int(11) NOT NULL AUTO_INCREMENT,\n  PRIMARY KEY (`userconstantid`)\n) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8'


'todolist', 'CREATE TABLE `todolist` (\n  `todoid` int(11) NOT NULL AUTO_INCREMENT,\n  `userid` int(11) DEFAULT NULL,\n  `isCompletedTasks` tinyint(1) NOT NULL,\n  PRIMARY KEY (`todoid`)\n) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8'


'todoslistitems', 'CREATE TABLE `todoslistitems` (\n  `userid` int(11) DEFAULT NULL,\n  `item` varchar(1000) DEFAULT NULL,\n  `todoid` int(11) DEFAULT NULL,\n  `todonumber` int(11) DEFAULT NULL\n) ENGINE=InnoDB DEFAULT CHARSET=utf8'


процедуры и функции:

RegUser, Cleartodoslistitems, check_pass2

CREATE DEFINER=`root`@`localhost` PROCEDURE `RegUser`(in user varchar(400), in pass varchar(400))
BEGIN

    DECLARE l_phrase VARCHAR(100);
	declare l_key varchar(1000) default SHA2(l_phrase,512);
    DECLARE l_pass VARBINARY(1000);
	 
	CALL write_log('Create User:');
	  
	select phase into l_phrase from passpshrase;
    SET l_key = SHA2(l_phrase,512);
	 
	insert into passwords(password, username) values (AES_ENCRYPT(pass,l_key), user);
	  
	commit;
	  
	CALL write_log(concat('User ', user, ' created'));

END


CREATE DEFINER=`root`@`localhost` PROCEDURE `saveTodos`(in inusername varchar(400), in item varchar(1000), in isCtasks boolean, in intodonumber integer)
BEGIN
  
  declare l_cnt integer;
  
  declare l_userid integer;
  
  Select userconstantid into l_userid 
    from passwords 
   where username = inusername;
  
  Select count(*) into l_cnt 
    from todolist
   where userid = l_userid;
  
  if (l_cnt = 0) then
     insert into todolist(userid, isCompletedTasks) values (l_userid, isCtasks);
  else
     update todolist set isCompletedTasks = isCtasks 
	  where userid = l_userid;
  end if;

  insert into todoslistitems (userid, item, todoid, todonumber) values (l_userid, item, 1, intodonumber); /*always 1 because multilist mode is not supplied*/

  commit;
END

CREATE DEFINER=`root`@`localhost` PROCEDURE `write_log`(in in_mess varchar(400))
BEGIN
   declare l_dat varchar(400);
   Select curdate() into l_dat;
   insert into log2(dat, mess) values (l_dat, in_mess);
   commit;
END

CREATE DEFINER=`root`@`localhost` FUNCTION `check_pass2`(in_username varchar(1000), in_password varchar(1000)) RETURNS int(11)
BEGIN
    declare l_phrase varchar(1000);
    declare l_cnt integer;
    declare checkflag boolean;
    
    Select phase into l_phrase from passpshrase;
    
    Select count(*) into l_cnt from passwords 
     where username = in_username 
       and AES_DECRYPT(password, SHA2(l_phrase,512)) = in_password; 
       
    if (l_cnt > 0) then
       SET checkflag=true;
    else
       SET checkflag=false;
    end if;
    
    return checkflag;

END

CREATE DEFINER=`root`@`localhost` FUNCTION `get_password`(in_username varchar(1000), in_password varchar(1000)) RETURNS varchar(1000) CHARSET utf8
BEGIN
  declare l_phrase varchar(1000);
  declare l_pass varchar(1000);

  Select phase into l_phrase from passpshrase;
  Select AES_DECRYPT(password, SHA2(l_phrase,512)) into l_pass from passwords 
          where username = in_username 
			and AES_DECRYPT(password, SHA2(l_phrase,512)) = in_password;
            
RETURN l_pass;
END

CREATE DEFINER=`root`@`localhost` FUNCTION `get_username`(in_username varchar(1000)) RETURNS varchar(1000) CHARSET utf8
BEGIN
   declare l_user varchar(1000);
   
   Select username into l_user from passwords where username = in_username;

RETURN l_user;
END
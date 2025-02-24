
function Notif_Toast(toast, title , description, status) {
    return (
        toast({
            title: title,
            description: description ,
            status: status ,
            duration: 5000,
            isClosable: true,
          })
    )
  }
export default Notif_Toast;
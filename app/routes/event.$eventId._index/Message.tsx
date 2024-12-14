type Props = {
   message: string;
   username: string;
};

export const Message = ({ username, message }: Props) => {
   return (
      <>
         {message.split(new RegExp(`(@${username})`)).map((part, index) => {
            return part.startsWith(`@${username}`) ? (
               <span key={index} className="text-primary font-medium">
                  {part}
               </span>
            ) : (
               part
            );
         })}
      </>
   );
};

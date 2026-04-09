type Props = {
   message: string;
   username: string;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isUrl = (value: string) => /^(https?:\/\/|www\.)\S+$/i.test(value);

const toHref = (value: string) => (value.startsWith("http") ? value : `https://${value}`);

export const Message = ({ username, message }: Props) => {
   const mentionRegex = new RegExp(`(@${escapeRegExp(username)})`);
   const parts = message.split(/((?:https?:\/\/|www\.)\S+)/gi);

   return (
      <>
         {parts.map((part, index) => {
            if (isUrl(part)) {
               return (
                  <a
                     key={index}
                     href={toHref(part)}
                     target="_blank"
                     rel="noreferrer noopener"
                     className="text-primary underline break-all"
                  >
                     {part}
                  </a>
               );
            }

            return part.split(mentionRegex).map((mentionPart, mentionIndex) => {
               const key = `${index}-${mentionIndex}`;

               return mentionPart.startsWith(`@${username}`) ? (
                  <span key={key} className="text-primary font-medium">
                     {mentionPart}
                  </span>
               ) : (
                  <span key={key}>{mentionPart}</span>
               );
            });
         })}
      </>
   );
};

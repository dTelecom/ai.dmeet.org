import type { IUseChat } from "@dtelecom/components-react";
import * as React from "react";
import { useCallback, useEffect } from "react";
import type { ReceivedChatTranscription } from "@dtelecom/components-core";
import { DataTopic } from "@dtelecom/components-core";
import axios from "axios";

interface TranslationManagerProps {
  language?: string;
  chatContext: IUseChat;
}

export const TranslationManager = ({
  language,
  chatContext: { transcriptions, addLocalMessage }
}: TranslationManagerProps) => {
  const currentIndex = React.useRef<number>(0);

  const addToChatOrTranslate = useCallback(() => {
    for (let i = currentIndex.current; i < transcriptions.length; i++) {
      currentIndex.current = currentIndex.current + 1;

      const item = transcriptions[i];
      if (!item) return;

      if (language && item.language !== language) {
        void translate(item.transcription, item.language, language)
          .then((translated) => {
            if (translated) {
              sendItem(
                {
                  ...item,
                  transcription: translated
                },
                true
              );
            }
          })
          .catch((e) => {
            console.error("error translating", e);
            sendItem(item);
          });
      } else {
        sendItem(item);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptions.length]);

  const translate = useCallback(
    async (text: string, source: string, target: string) => {
      const response = await axios.post<{ translated: string }>(
        "https://voice.dmeet.org/translate",
        {
          text,
          source,
          target
        }
      );

      return response.data.translated;
    },
    []
  );

  const sendItem = (item: ReceivedChatTranscription, translated?: boolean) => {
    if (addLocalMessage && item?.from) {
      addLocalMessage(
        item.transcription,
        item.from,
        DataTopic.CHAT,
        item.timestamp,
        "transcription",
        item.language,
        translated ? language : undefined
      );
    }
  };
  useEffect(() => {
    addToChatOrTranslate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptions.length]);

  return <></>;
};

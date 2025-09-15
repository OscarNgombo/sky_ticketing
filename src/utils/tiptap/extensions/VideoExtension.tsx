import {Node, mergeAttributes} from '@tiptap/core';

export type HtmlAttrValue = string | number | boolean | null | undefined;

export interface VideoOptions {
    HTMLAttributes: Record<string, HtmlAttrValue>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        video: {
            /**
             * Add a video embed
             */
            setVideo: (options: { src: string }) => ReturnType;
        };
    }
}

export const VideoExtension = Node.create<VideoOptions>({
    name: 'video',
    group: 'block',
    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            src: {
                default: null as string | null,
            },
        };
    },

    parseHTML() {
        return [{tag: 'iframe[src*="youtube.com"], iframe[src*="vimeo.com"]'}];
    },

    renderHTML({HTMLAttributes}) {
        return ['div', {class: 'video-wrapper'}, ['iframe', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]];
    },

    addCommands() {
        return {
            setVideo: (options) => ({commands}) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                });
            },
        };
    },
});
import React, {createContext, useContext, useState} from 'react'

export type LayoutConfig = {
    leftText: string
    leftButtonText: string
    rightItems: React.ReactNode[]
    mainContentClassName?: string
}
const defaultLayout: LayoutConfig = {
    leftText: 'Sky Ticketing',
    leftButtonText: 'Vendor',
    rightItems: [],
    mainContentClassName: undefined,
}

export const LayoutContext = createContext<{
    layout: LayoutConfig
    setLayout: React.Dispatch<React.SetStateAction<LayoutConfig>>
} | null>(null)

export function LayoutProvider({children}: { children: React.ReactNode }) {
    const [layout, setLayout] = useState<LayoutConfig>(defaultLayout)
    return (
        <LayoutContext.Provider value={{layout, setLayout}}>
            {children}
        </LayoutContext.Provider>
    )
}

export function useLayout() {
    const ctx = useContext(LayoutContext)
    if (!ctx) throw new Error('useLayout must be used within LayoutProvider')
    return ctx
}

export function useSetLayout(config: LayoutConfig) {
    const {setLayout} = useLayout()
    React.useEffect(() => {
        setLayout((prev) => {
            const same =
                prev.leftText === config.leftText &&
                prev.leftButtonText === config.leftButtonText &&
                prev.mainContentClassName === config.mainContentClassName &&
                prev.rightItems === config.rightItems
            return same ? prev : config
        })
    }, [config.leftText, config.leftButtonText, config.mainContentClassName, config.rightItems, setLayout])
}

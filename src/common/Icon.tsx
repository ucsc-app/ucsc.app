
export function Icon({ svg, data }: { svg: string, data: string }) {
    return (
        <div style={{alignContent: "left", display: "flex"}}>
            <p style={{ margin: '-2px 0' }}>
                <img
                    src={svg}
                    alt={data}
                    style={{ verticalAlign: 'bottom' }}>
                </img>
                {' ' + data}
            </p>
        </div>
    )
}
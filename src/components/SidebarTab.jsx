const SidebarTab = ({children, isActive, onClick}) => {
    return ( 
        <div onClick={onClick} className={`${isActive ? "sidebar__menu--selected" : ""}`}>
            {children}
        </div>
     );
}
 
export default SidebarTab;